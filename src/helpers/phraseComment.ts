import OpenAI from "openai";
import { LLMConfig } from "../types/llm-config";

/**
 * Generates a YouTube comment using OpenAI based on customizable options.
 */
export default async function generateYouTubeComment({
  apiKey,
  title,
  description,
  model = "gpt-4o-mini-2024-07-18",
  llmConfig,
}: {
  apiKey: string;
  title: string;
  description: string;
  model?: OpenAI.Chat.ChatModel;
  llmConfig: LLMConfig;
}): Promise<string | null> {
  const prompt = llmConfig.prompt
    .replace("$title", title)
    .replace("$description", description);

  try {
    const openai = new OpenAI({
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: llmConfig.modelInstructions,
        },
        { role: "user", content: prompt },
      ],
    });

    const resultText = completion.choices[0].message?.content?.trim() || "";

    if (resultText.toLowerCase() === "skip") {
      return null; // Skip commenting on this video
    }

    return resultText;
  } catch (error) {
    console.error("Error generating comment with OpenAI:", error);
    return null;
  }
}
