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

  if (
    (config.exactSearchTerms || []).length +
      (config.looseSearchTerms || []).length ===
    0
  ) {
    console.error(
      "Please at least one search term, either exact, loose or both"
    );
    return false;
  }

  return true;
};
