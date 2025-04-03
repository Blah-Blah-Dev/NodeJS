import OpenAI from "openai";
import { LLMConfig } from "./llm-config";

export interface ScriptConfig {
  projectId?: string;
  openAiApiKey: string;
  openAiModel?: OpenAI.Chat.ChatModel;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  llmConfig?: LLMConfig;
  exactSearchTerms?: string[];
  looseSearchTerms?: string[];
  resultsPerJob?: number;
  publishTimeframe?: {
    min: number;
    max: number;
  };
}
