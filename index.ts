import { config as loadEnv } from "dotenv";
import { config, higgsfield, APIError, HiggsfieldError } from "@higgsfield/client/v2";

// Load HF_CREDENTIALS from .env.local without overriding variables already set
// in the environment. dotenv's own logging is silenced so nothing about the
// file's contents reaches stdout.
loadEnv({ path: ".env.local", quiet: true });

const MODEL = "bytedance/seedance-2.5/text-to-video";

async function main(): Promise<number> {
  if (!process.env.HF_CREDENTIALS) {
    console.error("HF_CREDENTIALS is not set. Add it to .env.local as KEY_ID:KEY_SECRET.");
    return 1;
  }

  config({
    credentials: process.env.HF_CREDENTIALS,
    // Video generation can take a while; poll for up to 15 minutes.
    maxPollTime: 15 * 60 * 1000,
  });

  console.log(`Submitting request to ${MODEL}...`);

  const result = await higgsfield.subscribe(MODEL, {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  // The SDK types don't list "canceled", but the API can return it.
  const status = result.status as string;

  switch (status) {
    case "completed": {
      const url = result.video?.url;
      if (!url) {
        console.error(`Request ${result.request_id} completed but returned no video URL.`);
        return 1;
      }
      console.log(`Request ${result.request_id} completed.`);
      console.log(`Video URL: ${url}`);
      return 0;
    }
    case "failed":
      console.error(`Request ${result.request_id} failed.`);
      return 1;
    case "nsfw":
      console.error(`Request ${result.request_id} was rejected by content moderation.`);
      return 1;
    case "canceled":
      console.error(`Request ${result.request_id} was canceled.`);
      return 1;
    default:
      console.error(`Request ${result.request_id} ended with unexpected status "${status}".`);
      return 1;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    // Print only the error class, message and status code, never the request
    // config, which carries the credentials in its headers.
    if (error instanceof APIError) {
      console.error(`${error.name}: ${error.message} (HTTP ${error.statusCode ?? "unknown"})`);
    } else if (error instanceof HiggsfieldError) {
      console.error(`${error.name}: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Unexpected error: ${error.message}`);
    } else {
      console.error("Unexpected error.");
    }
    process.exit(1);
  });
