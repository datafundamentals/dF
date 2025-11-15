import {computed, signal} from '@lit-labs/signals';
import type {FirestoreRequestState} from '@df/types';
import {collection, doc, setDoc, getFirestore, Timestamp} from 'firebase/firestore';

/**
 * State for seed data operations
 */
export interface SeedDataState {
  status: FirestoreRequestState;
  error: string | null;
  progress: number; // 0-100
  currentStep: string;
  isComplete: boolean;
}

/**
 * Hardcoded seed data for Firestore collections
 * This mirrors the data from packages/firebase-emulator/scripts/seed-data/firestore-collections/
 */
const FIRESTORE_SEED_DATA = {
  flowers: [
    {id: 'rose', name: 'Rose', description: 'The classic symbol of love and passion', color: 'red'},
    {id: 'tulip', name: 'Tulip', description: 'Elegant spring flower', color: 'purple'},
    {id: 'sunflower', name: 'Sunflower', description: 'Bright and cheerful', color: 'yellow'},
    {id: 'orchid', name: 'Orchid', description: 'Exotic and mysterious', color: 'white'},
    {id: 'lily', name: 'Lily', description: 'Graceful and timeless', color: 'pink'},
    {id: 'daisy', name: 'Daisy', description: 'Simple and innocent', color: 'white'},
    {id: 'lavender', name: 'Lavender', description: 'Fragrant and calming', color: 'purple'},
    {id: 'marigold', name: 'Marigold', description: 'Warm and vibrant', color: 'orange'},
    {id: 'chrysanthemum', name: 'Chrysanthemum', description: 'Diverse and beautiful', color: 'gold'},
    {id: 'iris', name: 'Iris', description: 'Regal and noble', color: 'blue'},
    {id: 'peony', name: 'Peony', description: 'Lush and romantic', color: 'pink'},
    {id: 'daffodil', name: 'Daffodil', description: 'Spring herald', color: 'yellow'},
  ],
  continents: [
    {id: 'asia', name: 'Asia', population: '4.7 billion', area: '44.6 million km²'},
    {id: 'africa', name: 'Africa', population: '1.4 billion', area: '30.4 million km²'},
    {id: 'north-america', name: 'North America', population: '0.6 billion', area: '24.7 million km²'},
    {id: 'south-america', name: 'South America', population: '0.4 billion', area: '17.8 million km²'},
    {id: 'antarctica', name: 'Antarctica', population: '0', area: '14.2 million km²'},
    {id: 'europe', name: 'Europe', population: '0.75 billion', area: '10.2 million km²'},
    {id: 'australia', name: 'Australia', population: '0.026 billion', area: '7.7 million km²'},
  ],
  chemicalElements: [
    {id: 'hydrogen', name: 'Hydrogen', symbol: 'H', atomicNumber: 1, atomicMass: 1.008},
    {id: 'helium', name: 'Helium', symbol: 'He', atomicNumber: 2, atomicMass: 4.003},
    {id: 'carbon', name: 'Carbon', symbol: 'C', atomicNumber: 6, atomicMass: 12.011},
    {id: 'nitrogen', name: 'Nitrogen', symbol: 'N', atomicNumber: 7, atomicMass: 14.007},
    {id: 'oxygen', name: 'Oxygen', symbol: 'O', atomicNumber: 8, atomicMass: 15.999},
    {id: 'sodium', name: 'Sodium', symbol: 'Na', atomicNumber: 11, atomicMass: 22.990},
    {id: 'iron', name: 'Iron', symbol: 'Fe', atomicNumber: 26, atomicMass: 55.845},
    {id: 'copper', name: 'Copper', symbol: 'Cu', atomicNumber: 29, atomicMass: 63.546},
    {id: 'silver', name: 'Silver', symbol: 'Ag', atomicNumber: 47, atomicMass: 107.868},
    {id: 'gold', name: 'Gold', symbol: 'Au', atomicNumber: 79, atomicMass: 196.967},
    {id: 'mercury', name: 'Mercury', symbol: 'Hg', atomicNumber: 80, atomicMass: 200.592},
    {id: 'lead', name: 'Lead', symbol: 'Pb', atomicNumber: 82, atomicMass: 207.200},
    {id: 'uranium', name: 'Uranium', symbol: 'U', atomicNumber: 92, atomicMass: 238.029},
  ],
  musicalInstruments: [
    {id: 'guitar', name: 'Guitar', type: 'String', family: 'Stringed'},
    {id: 'piano', name: 'Piano', type: 'Keyboard', family: 'Percussion'},
    {id: 'violin', name: 'Violin', type: 'String', family: 'Stringed'},
    {id: 'drums', name: 'Drums', type: 'Percussion', family: 'Percussion'},
    {id: 'trumpet', name: 'Trumpet', type: 'Brass', family: 'Wind'},
    {id: 'flute', name: 'Flute', type: 'Woodwind', family: 'Wind'},
    {id: 'saxophone', name: 'Saxophone', type: 'Woodwind', family: 'Wind'},
    {id: 'cello', name: 'Cello', type: 'String', family: 'Stringed'},
    {id: 'synthesizer', name: 'Synthesizer', type: 'Electronic', family: 'Electronic'},
    {id: 'harp', name: 'Harp', type: 'String', family: 'Stringed'},
    {id: 'clarinet', name: 'Clarinet', type: 'Woodwind', family: 'Wind'},
    {id: 'electric-guitar', name: 'Electric Guitar', type: 'String', family: 'Stringed'},
  ],
  todos: [
    {
      id: 'plan-firestore-demo',
      title: 'Plan Firestore Demo',
      titleLower: 'plan firestore demo',
      description: 'Outline the structure and key points',
      completed: true,
      priority: 'high',
      tags: ['planning', 'demo'],
      createdAt: Timestamp.fromDate(new Date('2024-01-15')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16')),
      dueDate: Timestamp.fromDate(new Date('2024-01-20')),
    },
    {
      id: 'write-todo-copy',
      title: 'Write Todo Copy',
      titleLower: 'write todo copy',
      description: 'Create engaging copy for todo items',
      completed: false,
      priority: 'medium',
      tags: ['writing', 'ux'],
      createdAt: Timestamp.fromDate(new Date('2024-01-16')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16')),
      dueDate: Timestamp.fromDate(new Date('2024-01-22')),
    },
    {
      id: 'record-realtime-gif',
      title: 'Record Realtime GIF',
      titleLower: 'record realtime gif',
      description: 'Capture realtime sync in action',
      completed: false,
      priority: 'high',
      tags: ['demo', 'video'],
      createdAt: Timestamp.fromDate(new Date('2024-01-17')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-17')),
      dueDate: Timestamp.fromDate(new Date('2024-01-25')),
    },
    {
      id: 'sync-seed-data',
      title: 'Sync Seed Data',
      titleLower: 'sync seed data',
      description: 'Ensure all seed data is synchronized',
      completed: false,
      priority: 'medium',
      tags: ['testing', 'data'],
      createdAt: Timestamp.fromDate(new Date('2024-01-18')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-18')),
      dueDate: Timestamp.fromDate(new Date('2024-01-28')),
    },
    {
      id: 'add-pagination-tests',
      title: 'Add Pagination Tests',
      titleLower: 'add pagination tests',
      description: 'Write comprehensive test suite',
      completed: false,
      priority: 'medium',
      tags: ['testing', 'pagination'],
      createdAt: Timestamp.fromDate(new Date('2024-01-19')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-19')),
      dueDate: Timestamp.fromDate(new Date('2024-02-05')),
    },
    {
      id: 'design-filter-menu',
      title: 'Design Filter Menu',
      titleLower: 'design filter menu',
      description: 'Create intuitive filter interface',
      completed: false,
      priority: 'high',
      tags: ['design', 'ux'],
      createdAt: Timestamp.fromDate(new Date('2024-01-20')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-20')),
      dueDate: Timestamp.fromDate(new Date('2024-02-10')),
    },
    {
      id: 'document-offline',
      title: 'Document Offline',
      titleLower: 'document offline',
      description: 'Write offline functionality docs',
      completed: false,
      priority: 'low',
      tags: ['docs', 'offline'],
      createdAt: Timestamp.fromDate(new Date('2024-01-21')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-21')),
      dueDate: Timestamp.fromDate(new Date('2024-02-15')),
    },
    {
      id: 'prep-query-examples',
      title: 'Prep Query Examples',
      titleLower: 'prep query examples',
      description: 'Prepare example queries for docs',
      completed: false,
      priority: 'medium',
      tags: ['docs', 'queries'],
      createdAt: Timestamp.fromDate(new Date('2024-01-22')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-22')),
      dueDate: Timestamp.fromDate(new Date('2024-02-12')),
    },
    {
      id: 'review-accessibility',
      title: 'Review Accessibility',
      titleLower: 'review accessibility',
      description: 'Ensure WCAG compliance',
      completed: false,
      priority: 'high',
      tags: ['a11y', 'testing'],
      createdAt: Timestamp.fromDate(new Date('2024-01-23')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-23')),
      dueDate: Timestamp.fromDate(new Date('2024-02-01')),
    },
    {
      id: 'publish-storybook',
      title: 'Publish Storybook',
      titleLower: 'publish storybook',
      description: 'Deploy storybook to production',
      completed: false,
      priority: 'low',
      tags: ['deployment', 'docs'],
      createdAt: Timestamp.fromDate(new Date('2024-01-24')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-24')),
      dueDate: Timestamp.fromDate(new Date('2024-02-20')),
    },
    {
      id: 'draft-coaching-prompts',
      title: 'Draft Coaching Prompts',
      titleLower: 'draft coaching prompts',
      description: 'Create coaching prompt library',
      completed: false,
      priority: 'medium',
      tags: ['content', 'coaching'],
      createdAt: Timestamp.fromDate(new Date('2024-01-25')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-25')),
      dueDate: Timestamp.fromDate(new Date('2024-02-18')),
    },
    {
      id: 'prep-live-coding',
      title: 'Prep Live Coding',
      titleLower: 'prep live coding',
      description: 'Prepare live coding session',
      completed: false,
      priority: 'high',
      tags: ['demo', 'live-coding'],
      createdAt: Timestamp.fromDate(new Date('2024-01-26')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-26')),
      dueDate: Timestamp.fromDate(new Date('2024-02-08')),
    },
  ],
};

/**
 * Store for seeding Firestore with reference data
 * This is a development/emulator-only feature
 */
export class SeedDataStore {
  private readonly statusSignal = signal<FirestoreRequestState>('idle');
  private readonly errorSignal = signal<string | null>(null);
  private readonly progressSignal = signal<number>(0);
  private readonly currentStepSignal = signal<string>('');
  private readonly isCompleteSignal = signal<boolean>(false);

  readonly state = computed<SeedDataState>(() => ({
    status: this.statusSignal.get(),
    error: this.errorSignal.get(),
    progress: this.progressSignal.get(),
    currentStep: this.currentStepSignal.get(),
    isComplete: this.isCompleteSignal.get(),
  }));

  /**
   * Seed all Firestore collections with reference data
   */
  async seedFirestoreCollections(): Promise<void> {
    this.statusSignal.set('loading');
    this.errorSignal.set(null);
    this.progressSignal.set(0);
    this.isCompleteSignal.set(false);

    try {
      const db = getFirestore();
      const collectionNames = Object.keys(FIRESTORE_SEED_DATA) as Array<keyof typeof FIRESTORE_SEED_DATA>;
      const totalCollections = collectionNames.length;

      for (let i = 0; i < collectionNames.length; i++) {
        const collectionName = collectionNames[i];
        this.currentStepSignal.set(`Seeding ${collectionName}...`);

        await this.seedCollection(db, collectionName, FIRESTORE_SEED_DATA[collectionName] as Array<Record<string, unknown>>);

        const progress = Math.round(((i + 1) / totalCollections) * 100);
        this.progressSignal.set(progress);
      }

      this.statusSignal.set('ready');
      this.isCompleteSignal.set(true);
      this.currentStepSignal.set('Seed data loaded successfully');
    } catch (error) {
      this.statusSignal.set('error');
      this.errorSignal.set(error instanceof Error ? error.message : 'Failed to seed data');
      this.currentStepSignal.set('Error during seeding');
    }
  }

  /**
   * Seed a single Firestore collection
   */
  private async seedCollection(
    db: ReturnType<typeof getFirestore>,
    collectionName: string,
    documents: Array<Record<string, unknown>>
  ): Promise<void> {
    const collectionRef = collection(db, collectionName);

    for (const docData of documents) {
      const {id, ...data} = docData;
      if (typeof id !== 'string') continue;

      try {
        const docRef = doc(collectionRef, id);
        await setDoc(docRef, data, {merge: true});
      } catch (error) {
        console.error(`Error seeding ${collectionName}/${id}:`, error);
        throw error;
      }
    }
  }

  /**
   * Reset the store state
   */
  reset(): void {
    this.statusSignal.set('idle');
    this.errorSignal.set(null);
    this.progressSignal.set(0);
    this.currentStepSignal.set('');
    this.isCompleteSignal.set(false);
  }
}

/**
 * Global singleton instance
 */
export const seedDataStore = new SeedDataStore();
