# Normalize pub-control-panel

To know how to normalize df-pub-control-panel, you will first need to understand the history of this monorepo.

## History: 

This monorepo was built for creating apps and UI with a very careful and structured engineering design. That's the nice way to put it. A more accurate way might be that it is kind of a pain in the butt (human expression). But by engineering every single piece of UI and state/store and ... and ... in exactly the same way, it offers the maintainer of this monorepo the ability to grow it and still know where everything is - because it is all written in the same way.

You will read much about this in the guides that you will be given to go over - right after reading this guide.

So that is the history of the monorepo as it affects this ticket.

## An abberation in the history - vscode extensions.

This monorepo was not designed for the purpose of creating vscode extensions. This is kind of an abberation, something done, but it is a little bit out of ordinary.

For this reason, extensions attempt to put all the vscode extension logic inside one project, and then maintain a separate *-ui project which follows all of the rest of the standards that the all the rest of the app ui projects follow. Hopefully that makes sense? So for example `extensions/df-markdown-tools` attempts to have all the non-standard vscode extension code in it, and then `extensions/df-markdown-tools-ui` attempts to as much like any `apps/` project, hosting a ui, which in turn hosts `packages/ui-lit` which in turn call `packages/state` for back end functions, etc etc. The examples in both `extensions/df-markdown-tools` and `extensions/df-yaml-tools` should serve as adequate templates, if I have done my job right, in policing the creation of these tools.

## df-pub-control-panel history, so far

To get the basic control panel to the point where I could at least launch it - which is again kind of an abberation for this monorepo - I have created the df-pub-control-panel without following all the normal rules. It just launches a very basic opening screen which launches a very basic file read and display. But the ui and the state/store code is already non-compliant with the rest of the monorepo standards.

## Work Requested

The existing ui and state/store code found within `extensions/df-pub-control-panel` needs to be refactored to follow the same standards as the rest of the monorepo.

- separate extensions/df-pub-control-panel-ui 
- web component in packages/ui-lit
- state/store in packages/state
- all the normal testing and storybook work

Again, please examine both extensions/df-yaml-tools and extensions/df-markdown-tools for how they approach this.

## Manual Testing after completion

I will evaluate the completed work by running the UI and reviewing the code, before it is committed. 

It is customary for me to make several changes, so you will need to be ready to stay with this process before I declare it to be complete. Extra patience may be required, on your part.

