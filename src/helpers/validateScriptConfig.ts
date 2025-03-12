import { ScriptConfig } from "../types/script-config";

export default (config: ScriptConfig) => {
  if (!config.openAiApiKey) {
    console.error("Please pass OpenApi Api Key");
    return false;
  }

  if (!config.googleClientId) {
    console.error("Please pass Google Client ID");
    return false;
  }

  if (!config.googleClientSecret) {
    console.error("Please pass Google Client Secret");
    return false;
  }

  if (!config.googleRefreshToken) {
    console.error("Please pass Google Refresh Token");
    return false;
  }

  return true;
};
