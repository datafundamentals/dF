# RAG document standards

## Tag Processing & Type-ahead
- **Comma-delimited parsing** - All tag-like metadata fields (tags, is_a, child_of, has_a) are parsed as comma-separated strings
- **Firestore tag creation** - Each unique tag gets its own document in the `tags` collection
- **Deduplication** - Check for existing tags before creation to avoid duplicates
- **Type-ahead implementation** - Use AsyncComputed for Firestore tag searches with prefix matching
- **Search caching** - Cache search results by prefix to improve performance and reduce Firestore calls
- **Refresh mechanism** - Clear cache when new tags are saved using refresh trigger signals
