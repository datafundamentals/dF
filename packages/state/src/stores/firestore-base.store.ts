import {computed, signal} from '@lit-labs/signals';
import type {
  FirestoreCollectionConfig,
  FirestoreCollectionState,
  FirestoreDocument,
  FirestoreDocumentData,
  FirestoreMutationTransforms,
  FirestoreRequestState,
} from '@df/types';
import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  updateDoc,
  type CollectionReference,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

export interface FirestoreCollectionStoreOptions<TDocument extends FirestoreDocument>
  extends FirestoreCollectionConfig<TDocument>,
    FirestoreMutationTransforms<TDocument> {
  /** Query constraints applied before the first load. */
  initialQuery?: QueryConstraint[];
}

type Snapshot = QueryDocumentSnapshot<DocumentData>;

/**
 * Lightweight Firestore helper that manages pagination, CRUD operations, and
 * optional real-time listeners for a single collection. Domain stores compose
 * this class and provide any additional conversion logic.
 */
export class FirestoreCollectionStore<TDocument extends FirestoreDocument> {
  private readonly collection: CollectionReference<DocumentData>;
  private readonly defaultConstraints: QueryConstraint[];
  private readonly transforms: FirestoreMutationTransforms<TDocument>;
  private readonly mapDocument?: (value: TDocument) => TDocument;

  private currentQuery: QueryConstraint[];
  private readonly queryDescriptionSignal = signal<string | null>(null);
  private readonly documentsSignal = signal<readonly TDocument[]>([]);
  private readonly statusSignal = signal<FirestoreRequestState>('idle');
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastUpdatedSignal = signal<number | null>(null);
  private readonly pageSizeSignal = signal<number>(10);
  private readonly pageIndexSignal = signal<number>(0);
  private readonly hasNextSignal = signal<boolean>(false);
  private readonly hasPreviousSignal = signal<boolean>(false);
  private readonly listeningSignal = signal<boolean>(false);

  private unsubscribeRealtime: Unsubscribe | null = null;
  private pageAnchors: (Snapshot | null)[] = [null];
  private pendingRequestId = 0;

  readonly state = computed<FirestoreCollectionState<TDocument>>(() => ({
    status: this.statusSignal.get(),
    documents: this.documentsSignal.get(),
    error: this.errorSignal.get(),
    isListening: this.listeningSignal.get(),
    lastUpdated: this.lastUpdatedSignal.get(),
    currentPage: this.pageIndexSignal.get() + 1,
    pageSize: this.pageSizeSignal.get(),
    hasNextPage: this.hasNextSignal.get(),
    hasPreviousPage: this.hasPreviousSignal.get(),
    queryDescription: this.queryDescriptionSignal.get(),
  }));

  constructor(collection: CollectionReference<DocumentData>, options: FirestoreCollectionStoreOptions<TDocument> = {}) {
    this.collection = collection;
    this.defaultConstraints = options.defaultConstraints ?? [];
    this.transforms = {
      transformCreate: options.transformCreate,
      transformUpdate: options.transformUpdate,
    };
    this.mapDocument = options.mapDocument;
    this.currentQuery = options.initialQuery ?? [];
    this.queryDescriptionSignal.set(options.defaultQueryDescription ?? null);
    this.pageSizeSignal.set(options.pageSize ?? 10);
  }

  async loadInitialPage(): Promise<void> {
    this.pageAnchors = [null];
    await this.loadPageAt(0);
  }

  async loadNextPage(): Promise<void> {
    if (!this.hasNextSignal.get()) return;
    await this.loadPageAt(this.pageIndexSignal.get() + 1);
  }

  async loadPreviousPage(): Promise<void> {
    if (!this.hasPreviousSignal.get()) return;
    await this.loadPageAt(this.pageIndexSignal.get() - 1);
  }

  async refresh(): Promise<void> {
    await this.loadPageAt(this.pageIndexSignal.get());
  }

  async setQuery(constraints: QueryConstraint[], description: string | null = null): Promise<void> {
    this.currentQuery = constraints;
    this.queryDescriptionSignal.set(description);
    this.stopRealtime();
    await this.loadInitialPage();
  }

  async setPageSize(size: number): Promise<void> {
    if (size <= 0) throw new Error('Page size must be positive');
    if (this.pageSizeSignal.get() === size) return;
    this.pageSizeSignal.set(size);
    await this.loadInitialPage();
  }

  startRealtime(): void {
    this.stopRealtime();
    const builtQuery = this.buildQuery(this.pageIndexSignal.get());
    this.statusSignal.set('loading');
    this.errorSignal.set(null);

    this.unsubscribeRealtime = onSnapshot(
      builtQuery,
      (snapshot) => {
        const prepared = this.processSnapshot(snapshot.docs as Snapshot[]);
        this.documentsSignal.set(prepared.documents);
        this.hasNextSignal.set(prepared.hasNextPage);
        this.hasPreviousSignal.set(this.pageIndexSignal.get() > 0);
        this.lastUpdatedSignal.set(Date.now());
        this.statusSignal.set('ready');

        if (prepared.anchor) {
          this.pageAnchors[this.pageIndexSignal.get() + 1] = prepared.anchor;
        } else {
          this.pageAnchors = this.pageAnchors.slice(0, this.pageIndexSignal.get() + 1);
        }
      },
      (error) => {
        this.statusSignal.set('error');
        this.errorSignal.set(error.message ?? 'Failed to listen for updates');
      }
    );

    this.listeningSignal.set(true);
  }

  stopRealtime(): void {
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
      this.unsubscribeRealtime = null;
    }
    this.listeningSignal.set(false);
  }

  async create(data: FirestoreDocumentData<TDocument>): Promise<string> {
    const basePayload = {...data};
    const payload = this.transforms.transformCreate ? this.transforms.transformCreate(basePayload) : basePayload;
    const docRef = await addDoc(this.collection, payload);
    return docRef.id;
  }

  async update(id: string, data: Partial<FirestoreDocumentData<TDocument>>): Promise<void> {
    const basePayload = {...data};
    const payload = this.transforms.transformUpdate ? this.transforms.transformUpdate(basePayload) : basePayload;
    if (!Object.keys(payload).length) return;
    await updateDoc(doc(this.collection, id), payload);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.collection, id));
  }

  private async loadPageAt(targetIndex: number): Promise<void> {
    this.pendingRequestId += 1;
    const requestId = this.pendingRequestId;
    this.stopRealtime();
    this.statusSignal.set('loading');
    this.errorSignal.set(null);

    try {
      const builtQuery = this.buildQuery(targetIndex);
      const snapshot = await getDocs(builtQuery);
      if (requestId !== this.pendingRequestId) return;

      const prepared = this.processSnapshot(snapshot.docs as Snapshot[]);
      this.documentsSignal.set(prepared.documents);
      this.lastUpdatedSignal.set(Date.now());
      this.hasNextSignal.set(prepared.hasNextPage);
      this.pageIndexSignal.set(targetIndex);
      this.hasPreviousSignal.set(targetIndex > 0);

      if (prepared.anchor) {
        this.pageAnchors[targetIndex + 1] = prepared.anchor;
      } else {
        this.pageAnchors = this.pageAnchors.slice(0, targetIndex + 1);
      }

      this.statusSignal.set('ready');
    } catch (error) {
      if (requestId !== this.pendingRequestId) return;
      this.statusSignal.set('error');
      this.errorSignal.set(error instanceof Error ? error.message : 'Failed to load documents');
    }
  }

  private buildQuery(pageIndex: number) {
    const constraints: QueryConstraint[] = [...this.defaultConstraints, ...this.currentQuery];
    const pageSize = this.pageSizeSignal.get();
    const anchor = this.pageAnchors[pageIndex];
    if (anchor) constraints.push(startAfter(anchor));
    constraints.push(limit(pageSize + 1));
    return query(this.collection, ...constraints);
  }

  private processSnapshot(docs: Snapshot[]) {
    const pageSize = this.pageSizeSignal.get();
    const hasNextPage = docs.length > pageSize;
    const trimmedDocs = hasNextPage ? docs.slice(0, pageSize) : docs;

    const documents = trimmedDocs.map((docSnap) => this.hydrateDocument(docSnap));
    const anchor = trimmedDocs.length ? trimmedDocs[trimmedDocs.length - 1] : null;

    return {documents, hasNextPage, anchor} as const;
  }

  private hydrateDocument(snapshot: Snapshot): TDocument {
    const raw = snapshot.data() as Record<string, unknown>;
    const baseDoc = {id: snapshot.id, ...raw} as TDocument;
    return this.mapDocument ? this.mapDocument(baseDoc) : baseDoc;
  }
}
