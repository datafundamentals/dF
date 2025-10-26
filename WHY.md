# Why This Monorepo?

_This monorepo wonders:_ **What would happen if I just _quit throwing coding obstacles in front of myself?_**

**TL;DR:** Do things in a logical way. Design a system where parts play well with other parts. The net net: I get my personal time back. That's something I wanted.

<a id="top"></a>
## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Standards Standards Standards!!](#standards-standards-standards)
- [$$$$ and Power](#and-power)
- [Multiple Apps as Architecture Clones](#multiple-apps-as-architecture-clones)
- [Deploys to Cheapest and Easiest Hosts with Ease](#deploys-to-cheapest-and-easiest-hosts-with-ease)
- [Speed - as in Coding Agent Friendly](#speed-as-in-coding-agent-friendly)
- [Control](#control)
- [Fun! - Open Source!](#fun-open-source)
- [Services Galore](#services-galore)
- [Any to Any](#any-to-any)
- [Shared Widgets and Functions](#shared-widgets-and-functions)


## Performance Metrics

When you start seeing numbers like this, performance starts to matter. _A lot._


<table style="border: 1px solid black; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid black; padding: 8px;">Approach</th>
      <th style="border: 1px solid black; padding: 8px;">App Startup Time</th>
      <th style="border: 1px solid black; padding: 8px;">Memory Usage</th>
      <th style="border: 1px solid black; padding: 8px;">Network Calls</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid black; padding: 8px;"><strong>Eager</strong> (all services at startup)</td>
      <td style="border: 1px solid black; padding: 8px;">800ms</td>
      <td style="border: 1px solid black; padding: 8px;">15MB</td>
      <td style="border: 1px solid black; padding: 8px;">5 requests</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px;"><strong>Lazy</strong> (on-demand)</td>
      <td style="border: 1px solid black; padding: 8px;">200ms ✅</td>
      <td style="border: 1px solid black; padding: 8px;">5MB ✅</td>
      <td style="border: 1px solid black; padding: 8px;">1 request ✅</td>
    </tr>
  </tbody>
</table>

The above is just a snippet from [_this internal doc_](apps/df-firebase-teaching-app0/guides/PERFORMANCE_PATTERNS.md)


The idea is simple - fix everything at the architectural level, then replicate that across all your apps! This is even easier, with a monorepo such as this.

[Back to top](#top)
---

## Standards Standards Standards!!

Write with standards, or your software is probably future abandonware.

Decade after decade, fads come, fads go. _Not interested._ Only because I have written so much allegedly really cool cutting edge code that isn't even runnable, 5 years later, because the industry moves on and doesn't support it. Flash anyone? Java Swing? Powerbuilder? JQuery? Yeah, it's all amazing - until it isn't. _There's n years of my professional life I'll never get back..._

Vibe coding is bad vibes, in my world. React, Nextjs, even the awesome industry darling Svelte is all non-standard, from where I live. If something has migrated to the browser standard, I use that. If your stack insists on remaining non-standard, heh, you go your way, I'll go mine. _**Abandonware**, in the making._

Here's what i do - I scour for every tech i can that seems to be in _**aggressive pursuit of all the latest standards**_ - Like Lit, for example.

I also follow the people themselves, that have the patience and strength to work towards consensus on these same standards, often for 5 or 10 years just on one standard! The previous(?) google chrome team, and the guys at Open-wc like Thomas Allmer and Benny Powers and Westbrook Johnson.

[Justin Fagnini](https://justinfagnani.com/) is my ultimate hero. Drafting standards, researching future stacks such as Signals, architect of Lit, big thinker and low level coder, patient participant with the years that it takes to build concensus on standards bodies such as W3C.

[Back to top](#top)

---

## $$$$ and Power

I want to use all the most **powerful** back end tech, I just **don't want to pay for it** until it hits scale, as a commercial app.

Firebase gives me that exact thing. Don't think about Firebase as THE option, just do pick AN option such as Firebase that provides:

- _**Free tier**_ is plenty big enough to get your skills up and the bugs worked out of anything you build.
- _**Documentation**_ and tooling that is sweet, easy, well maintained and comes and in many forms. Coding agents love that, too.
- _**Mature stacks**_. Years and years of bug fixes and iterative releases.
- _**Features**_ so broad that it takes some studying just to fully understand everything that is being offered.

Feature Examples (there's tons more):
  - hosting
  - file storage
  - database (firestore)
  - messaging (pub-sub)
  - local emulator
  - a serverless functions
  - analytics
  - authentication
  - back end security rules

[Firebase site](https://firebase.google.com/)


[Back to top](#top)

---

## Multiple Apps as Architecture Clones

This monorepo features a standard set of apps to use as kind of clones for other apps.

The advantage this offers is that every app throughout the monorepo is

- written in the same way
- against the same coding docs
- using the same set of components, when needed
- selecting from the same back end services
- following the same standards

This makes a new app easy to crank out in a couple hours with coding agents, yet totally maintainable, going forward.

---

## Deploys to Cheapest and Easiest Hosts with Ease

I've done this with other repos, have yet to implement here but all apps, and services should easily deploy to the cheapest hosts with ease.

Then, when you're ready to deploy to the big boys, it's all set up and ready to roll.

[Back to top](#top)

---

## Speed as in Coding Agent Friendly

I'm all about speed. There are always more apps I want to do.

Coding agents get a lot my work done for me, I'm just a traffic cop, much of the time, now.

This monorepo gives them a common place to work where they can all consult the existing code as an example, learn from that, and get their job done.

It works. Fast.

[Back to top](#top)

---

## Control

Sure, I like the speed of being able to do things with coding agents like:

- claude code
- codex
- copilot (agents)
- cursor
- intellij agents

I like to split up my work into small tickets like everyone else in the industry. I also like to rotate my tickets through each of the coding agents - in a loop - that gives me a chance to learn each one, see what works best and worst, etc.

But but but - coding agents get out of control even faster than humans. Things get reeeeal whacko, real fast. Or, at least that has been my experience.

The cool thing about the monorepo is that i get to run all the tickets, all the agents, all through the same set of docs as a starting context.

By forcing each coding agent to reference the same set of docs, and constantly improving those docs as I learn more from each ticket, I am getting better and better control over my process. 

- Misunderstandings are becoming smaller and less frequent.
- I can easily direct them back to a doc when they start to go off track.

And, theoretically, even humans could consult these docs. Even if I doubt any ever would. 

[Back to top](#top)

---

## Fun! Open Source

Open source is fun, especially when it has value to others.

I code because i like to code, but it is always more fun when I can release it to others, get feedback, raise a little hell.

Life is good.

[Back to top](#top)

---

## Services Galore

I generally need to experiment with a few similar services for a while before if figure out which one is going to work best for me, long term. This could mean back end apis, database servers, any number of things that apps, packages, or other services need to get their work done.

Usually I'll deploy first to my local to test it out without running up a bill, and get all the machinery working. Then if starts to work well, deploy it remote hosts, or even use a SAS offering.

This monorepo lets me wonder about and explore any number of services with reckless abandon. Some things end up working, others, not so much. But it's all right here, and integrated with everything else I am doing, right from the get-go.

[Back to top](#top)


---

## Any to Any

If you've read this far, you probably figured out that there's a bunch of potential complexity, here. 

What could possibly go wrong? Well, one thing that can go wrong is different pieces don't know how to talk to each other. 

That's why this monorepo has a central types package that any app, package, or service can use to converse with any other app, package, or service.

The result is that it's just a lot easier for everything to talk to everything else without having to adopt a bunch of translation layers.


[Back to top](#top)


---

## Shared Widgets and Functions

Copy-Pasting: _Bad_

You have multiple apps sharing a lot of small chunks of code. You don't want to start copy-pasting the same code into multiple projects, just because you need them everywhere. 

These are all the shared code modules _**that could have been copy-pasted to multiple repositories**_, as of Oct 2025, within this monorepo

```asci


packages
├── config
│   ├── src
│   │   └── index.ts
├── firebase
│   ├── src
│   │   ├── auth
│   │   ├── emulator-detection.d.ts
│   │   ├── emulator-detection.ts
│   │   ├── firebase-app.ts
│   │   ├── firestore
│   │   ├── functions
│   │   ├── index.ts
│   │   └── storage
├── state
│   ├── coverage
│   │   ├── base.css
│   │   ├── block-navigation.js
│   │   ├── coverage-final.json
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── prettify.css
│   │   ├── prettify.js
│   │   ├── sort-arrow-sprite.png
│   │   ├── sorter.js
│   │   ├── stores
│   │   └── utils
├── types
│   ├── src
│   │   ├── df-segmented-button.ts
│   │   ├── df-upload-link.ts
│   │   ├── firebase-auth.types.ts
│   │   ├── firebase-firestore.types.ts
│   │   ├── firebase-storage.types.ts
│   │   ├── firebase-todos.types.ts
│   │   ├── firebase.types.ts
│   │   ├── index.ts
│   │   ├── npm-info.ts
│   │   └── practice-widget.ts
└── ui-lit
    ├── src
    │   ├── __tests__
    │   ├── df-markdown-codemirror.ts
    │   ├── df-npm-info-widget.ts
    │   ├── df-practice-widget.ts
    │   ├── df-segmented-button.ts
    │   ├── df-upload-link-auth.ts
    │   ├── df-upload-link-store.ts
    │   ├── df-upload-link-types.ts
    │   ├── df-upload-link.ts
    │   ├── file-processing.ts
    │   ├── firebase
    │   ├── index.ts
    │   └── my-element.ts

```
I've already got [hundred+] standalone repostitories scattered around different providers across the web. None work together. Most are half baked experiments that don't share, don't play well with each other.

There has to be a better way.

[Back to top](#top)


