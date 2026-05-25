# Intro: Agentic Shift Issues Defined

May 15 2026 - I just spent a week thrashing - got ready to shift work to agents and instead of easy street, it felt like I was stuck in the mud at every turn. Couldn't go forward, couldn't consider options - no remaining work would be doable with agents.

I knew that others were getting their work done with agents. What could be the source of my problem(s)?

TL;DR: 

- **Security** Most of the issues happen at ill defined boundaries between units of work - almost always at the human maintained security boundaries. 
- **Handoffs** The remaining issues seem mostly at unrecognized boundary conditions of handoffs between systems. 
- **Cost Churn** A remaining issue is expected churn around systems being positioned for future migration to mitigate vendor cost concerns.

## Building on Successes

The system is definitely in an 80/20 state. I have definitely resolved most of the issues that would prevent me from migrating to an agentic enabled development system ... even if the work remaining is going to require some very careful design iterations.

### Good Enough Standard

Most problems have been solved just by coming up with a good enough standard for everything. Lit WCs, Firebase back end rule-glue, 11ty with git-resolved content, and an easy to originate theming system with MD3 and my own themes have solved 80% of the issues.

Because of these, there is only one way to do the main thing, and it is simple and dumb enough to work every time.

### Years Invested on High Performance Standards

A no-compromises view of Good Enough has equipped me with a sweet spot of high performance and doable standards at every major juncture.

"There be Demons" with every major choice of tech stacks. So far, most have been avoided. This work is behind me.

Yes, there are still opportunities for improvement, but not major structural, hard to achieve, or bespoke/expensive.

### Ralph Loop Reachable

Any unit of work that can fit in the Ralph Loop as discrete documented chunks where each is fully SDLC testable makes for an agentic capacity

See https://eastgate-software.com/7-stages-of-software-development-life-cycle-sdlc-you-need-to-know/

Exceptions: See below - still to be resolved.

## The 3 Tells

There are 3 tells that define a higher probability of failure in agentic workflow:

- composability in units of work
- context size
- ambiguity within ralph loop

If either of these breaks - the likelyhood of success is diminished.

The flip side is that if you can solve for each of these first, you can probably do anyhing, and often with a cheaper model.

## Rigor Around Secrets

This might be a personal problem? Maybe others do this differently?

Lack of extreme rigor around secrets causes me a ridiculous amount of anxiety, resistance, and expense.

I don't approach with extreme rigor. I refuse - for many human reasons. Then I end up with a wide array of difficulties involving cascades. This almost always ends up badly for me, and I always act surprised.

- files stored all over the place or not at all
- everything done in a different way
- reliance on my memory for 
- writing down without a mental code for where and when
- not recording the memory widgets
- providing an insecure safe registry to write down secrets
- not regarding this every part of this as nearly sacred
- not having my cheat sheet and encrypted secrets with me
- wrong number of digits on cheat
- not recording one time issuance of keys
- failure to gitignore .env
- telling (or not telling if trusted backup) others about how to access
- lose-able thumb drive etc
- not knowing certain protocols like bcrypt or keys
- not knowing standards like sha and all others
- mixing up personal and corporate
- 
