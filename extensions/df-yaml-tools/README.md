# Read Me

** commands for the run-debug process

`cd extensions/df-yaml-tools && pnpm run copy:ui && pnpm run package && cd ../../`

The video that sort of documents this process - for what it is worth - is here

`/Volumes/Seagate5T/videoRecordings/howToVSCodeExtLaunch2025-12-12_04-49-30.mp4`


## how to make a vsix

This assumes you have already tested it in the run-debug process

1. modify package.json to update the version such as ""version": "0.0.9","
2. run this

`pnpm build && cd extensions/df-yaml-tools && pnpm run copy:ui && pnpm run pack && cd ../../`