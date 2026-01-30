# First Checkbox

The work of this ticket will be to add a disabled MD3 checkbox to each <div class="site-card"> within `packages/ui-lit/src/df-pub-control-panel.ts` in order to display whether or not a specicific site has any files which are either not added to git, or not committed to git.

The reason for being disabled is that this checkbox is not for controlling, but rather simply displaying the state.

This checkbox is primitive in it's operation, in this code iteration. Later iterations would allow for a refresh, if for example the user was to commit all the files in the site's directory. But in this iteration, the only way to refresh the view would be to close and then re-open the vscode view.