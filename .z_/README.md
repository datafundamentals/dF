# What Goes In This Folder?

**TL;DR:** Except as specifically directed by humans, files in this folder are maintained by humans, for the purpose of directing coding agents on specific tickets - past, present, future. When in doubt, humans should clean up their messes, and coding agents should disregard anything in this folder except as directed by humans.

## Primary Purpose - Keep The Monorepo Context Clean

To keep the context of the monorepo free of clutter, by providing a place for files that would only confuse the context of the general repository, excepting:

- **WIP** or work in progress
- **historical** or archives
- **future** such as technical debt not currently work in progress

## How To Know If a File goes Here?

- if it is only specific to one or more tickets, future, historical, or current WIP, then it goes in this folder. 

## Manual Maintenance

Humans, and not coding agents, are generally the maintainers of files in this folder. The following outlines the basic ideas, and the exceptions.

- The **future** folder is committed to git, and therefore maintained by git. Once a ticket is WIP or complete and no longer technical debt or a future ticket, it should be removed from **future** 
- **historical** folder is only for the convenience of a specific human user on his/her hard drive. What he does in that folder is strictly left to his discretion. The monorepo does not care.
- **WIP** is manually maintained and humans should clean this out as is appropriate, over time. The human is the ultimate arbiter over what is and is not related to WIP, coding agents are often asked to modify these files as a part of their WIP, but generally the human will do the cleanup when appropriate.