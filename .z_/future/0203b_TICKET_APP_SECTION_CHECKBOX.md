# New App Section and Checkbox for dashboard

If you read through the code in `packages/ui-lit/src/df-dashboard.ts` you will note that there is a new section at the bottom for dF, with a checkbox in it.

The dashboard needs an entirely different section, however, after this dF section. This is going to mean even more scrolling, but scrolling is a feature, and not a bug, for this dashboard tool.

So after the dF section that currently exists, there needs to be a similar ui separator, and then a new section for Apps.  In a visual sense, this section might mimic the top sites section, excepting that instead of a card for each site, there would be a card for each app. 

Which apps? Only the firebase apps will be represented here. These can be easily filtered by looking in the root of the `apps/*/package.json`, and filtering for firebase as a dependency. Any such instance indicates that this will be in the selection set.

Within the dF card, this ticket will require the placement of a  an `App repo: No changes since release` checkbox which is virtually identical in function to the current `${site.contentChanges` in `packages/ui-lit/src/df-dashboard.ts` excepting that instead of `Content repo: No changes since pub`, it will report any file changes after the date noted in version the app's package.json, as explained below.

Every `apps/*/package.json` shall have a version that looks like `"version": "0.0.1-260202",` where the metadata portion - 260202 in this instance - is always in the format YYMMDD. This metadata is a date tag, which is updated every time there is a new app release, regardless of the actual SemVer version (0.0.1) in this example.

This work is to be completed with code that is closely aligned with all of the other front end and back end code within the dashboard extension, especially as regards placement of files and separation of concerns.