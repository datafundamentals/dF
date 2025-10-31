# Instructions to User Before Initiating Coding Agent

0. Did you clean up from your last ticket, first?
   - old ticket descriptions removed from .z_/future/
   - ancillary materials no longer needed removed from .z_/future/WIP/
   - new branch started and labeled properly
1. Make sure that your ticket is well written and copied into .z_/future as a markdown document, or else published into github issues as a new issue. 
2. Before you submit your ticket for coding, consider inserting as many code reviews as is reasonable, between distinct steps. Don't assume that any one step will be done in a code compliant manner.
2. copy this exact text into your prompt, substituting the `[...insert ticket description link here...]` with the link to your ticket description from 1 above

```
Coding Agent Context Loading Instructions Sequence:

1. Before loading ticket description into your context, read and follow guides/1_TICKET_BEFORE_LOADING.md
2. Read this ticket description into your context. [...insert ticket description link here...]
3. After loading ticket description into your context, read and follow guides/2_TICKET_AFTER_LOADING.md
```