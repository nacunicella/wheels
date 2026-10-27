# Wheels.com.ar

Text-to-video generation with Higgsfield's Seedance 2.5 (`bytedance/seedance-2.5/text-to-video`) through the official `@higgsfield/client` SDK.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `HF_CREDENTIALS=KEY_ID:KEY_SECRET`. The file is git-ignored; keep the key server-side.
3. `npm start`

The example submits "A cinematic scene at sunset" (5s, 720p, 16:9), waits for completion, and prints the video URL. Failed, moderated (`nsfw`) and canceled requests exit with code 1. Each run is a billable generation.
