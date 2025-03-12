import axios from "axios";
import cron from "node-cron";
import { google, youtube_v3 } from "googleapis";
import dayjs from "dayjs";
import phraseComment from "./helpers/phraseComment";
import { ScriptConfig } from "./types/script-config";
import validateScriptConfig from "./helpers/validateScriptConfig";
import { LLMConfig } from "./types/llm-config";

// Utility function
function getTimeISO(minutesOffset: number): string {
  return dayjs().subtract(minutesOffset, "minute").toISOString();
}

export async function startCronJob(config: ScriptConfig, llmConfig: LLMConfig) {
  const MAX_RESULTS = Number.isFinite(Number(config.resultsPerJob))
    ? Number(config.resultsPerJob)
    : 10;

  // Setup OAuth2
  const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({
    refresh_token: config.googleRefreshToken,
  });

  // Setup YouTube
  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  // Inner function to search videos
  async function searchVideos(): Promise<youtube_v3.Schema$SearchResult[]> {
    // This represents the latest potential publish time of the videos we fetch
    let latestPublish = 30;
    // This represents the oldest potential publish time of the videos we fetch
    let oldestPublish = 90;

    if (config.publishTimeframe) {
      if (
        isFinite(config.publishTimeframe.min) &&
        isFinite(config.publishTimeframe.max)
      ) {
        latestPublish = config.publishTimeframe.min;
        oldestPublish = Math.min(
          config.publishTimeframe.max,
          latestPublish + 60
        );
      }
    }

    const publishedBefore = getTimeISO(latestPublish);
    const publishedAfter = getTimeISO(oldestPublish);
    const query = config.searchTerms
      .map((term) => `"${term.toLowerCase()}"`)
      .join(" OR ");

    try {
      const response = await youtube.search.list({
        part: ["snippet"],
        q: query,
        type: ["video"],
        publishedAfter,
        publishedBefore,
        maxResults: MAX_RESULTS,
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Error during video search:", error);
      return [];
    }
  }

  // Function to get video details
  async function getVideoDetails(
    videoId: string
  ): Promise<{ title: string; description: string } | null> {
    try {
      const response = await youtube.videos.list({
        part: ["snippet"],
        id: [videoId],
      });

      const video = response.data.items?.[0];
      if (!video || !video.snippet) return null;

      return {
        title: video.snippet.title ?? "",
        description: video.snippet.description ?? "",
      };
    } catch (error) {
      console.error(`Error fetching details for video ${videoId}:`, error);
      return null;
    }
  }

  // Post a comment
  async function postComment(videoId: string, commentText: string) {
    try {
      await youtube.commentThreads.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: commentText,
              },
            },
          },
        },
      });
      console.log(`Comment posted on video ${videoId}`);
    } catch (error) {
      console.error(`Error posting comment on video ${videoId}:`, error);
    }
  }

  // The actual job function
  async function runJob() {
    const videos = await searchVideos();

    let scheduledCount = 0;
    const totalMinutes = 60;
    const minDelay = (totalMinutes * 60 * 1000) / MAX_RESULTS;
    let accumulatedDelay = 0;

    for (const video of videos) {
      if (video.id?.videoId) {
        const videoId = video.id.videoId;

        const details = await getVideoDetails(videoId);
        if (details) {
          const comment = await phraseComment({
            openAiApiKey: config.openAiApiKey,
            openAiModel: config.openAiModel,
            title: details.title,
            description: details.description,
            llmConfig,
          });

          if (comment?.length) {
            const randomOffset = Math.floor(
              (Math.random() * 0.2 - 0.1) * minDelay
            );
            accumulatedDelay += minDelay + randomOffset;
            if (accumulatedDelay > totalMinutes * 60 * 1000) {
              accumulatedDelay = totalMinutes * 60 * 1000;
            }

            setTimeout(async () => {
              await postComment(videoId, comment);
            }, accumulatedDelay);
            scheduledCount++;
          }
        }
      }
    }
  }

  // Schedule the job
  cron.schedule("17 * * * *", () => {
    runJob().catch(console.error);
  });
}

export default async function (config: ScriptConfig) {
  try {
    // Validate the configuration object to make sure we received all required parameters
    if (!validateScriptConfig(config)) {
      console.error(`Invalid script config: ${config.projectId}`);
      return;
    }

    let llmConfig: LLMConfig;

    if (config.llmConfig) {
      llmConfig = config.llmConfig;
    } else {
      const response = await axios.get(
        `https://api.blahblah.dev/api/v1/projects/${
          config.projectId ?? "default"
        }`
      );

      llmConfig = response.data as LLMConfig;
    }

    if (
      !llmConfig ||
      !llmConfig.prompt ||
      typeof llmConfig.prompt !== "string" ||
      !llmConfig.modelInstructions ||
      typeof llmConfig.modelInstructions !== "string"
    ) {
      console.error(`Invalid LLM config`);
      return;
    }

    console.log(`BlahBlah validated successfully`);
    return startCronJob(config, llmConfig);
  } catch (error) {
    console.error("Error starting cron job:", error);
    throw error; // Rethrow for caller to handle
  }
}
