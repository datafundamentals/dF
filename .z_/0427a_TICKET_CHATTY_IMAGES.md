# Ticket 0427a - Chatty Images Mis-aligned

The short version of this is that images are showing up in the chatty-cathy ui on dev, but not when deployed to the 11ty site.

Even describing this ticket is needlessly complex, but that is also where the probable solution is found.

Look in packages/ui-lit/src/df-openclaw-chat-widget.ts and it is easy to see where the images should be. This is solved, in dev - the images are placed in the public directory - they show up in the dev view - the world is good.

But when we deploy to 11ty, images are placed in the 11ty file in /static/images. This folder means absolutely nothing to the deployed web component - so it simply shows a 404 in the console.

Seems to me that the probable solution for this problem is that these 2 images are deployed as part of the web component itself? Is this inappropriate? They are intentionally small files ...

Once this solution is arrived at, we need to establish it as a pattern going forward, because as a WCPGW this is a definite repeater.

We also need to align the docs, such that we don't keep creating this problem