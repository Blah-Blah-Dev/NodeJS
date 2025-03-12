import OpenAI from "openai";
import { LLMConfig } from "./llm-config";

export interface ScriptConfig {
  projectId?: string;
  openAiApiKey: string;
  model?: OpenAI.Chat.ChatModel;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  llmConfig?: LLMConfig;
  searchTerms: string[];
  resultsPerJob?: number;
  publishTimeframe?: {
    min: number;
    max: number;
  };
}
