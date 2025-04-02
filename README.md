# BlahBlah Package

## Introduction

Welcome to **BlahBlah**, an npm package that helps you automatically post comments on YouTube videos using your own YouTube account and OpenAI API key. **This means full control - no third-party dependencies managing your credentials.** You decide which account is used, ensuring transparency and security.

## Overview

The package requires a valid configuration object with credentials for:

1. **BlahBlah Project ID** (from [blahblah.dev](https://blahblah.dev))
2. **OpenAI API Key**
3. **Google Client ID**
4. **Google Client Secret**
5. **Google Refresh Token**

Once you have obtained these credentials, set them as **environment variables** (not hard-coded) and initialize the BlahBlah package in your Node.js project. The package will periodically (once-an-hour) search YouTube for newly published videos, and if certain criteria are met, it will post comments on those videos.

> It is recommended to deploy the BlahBlah bot in a separate repository rather than integrating it into an existing project. The simplest approach is to [clone this repository](https://replyke.com), deploy it, and configure your environment variables in your hosting platform. This ensures a clean setup and reduces potential conflicts with other application dependencies.

## Installation

Install the BlahBlah package from npm:

```bash
npm install blah-blah
```

Or, if you're using Yarn:

```bash
yarn add blah-blah
```

## Usage

Below is the most basic usage example:

```javascript
import blahBlah from "blah-blah";

const BLAHBLAH_PROJECT_ID = process.env.BLAHBLAH_PROJECT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

blahBlah({
  projectId: BLAHBLAH_PROJECT_ID,
  openAiApiKey: OPENAI_API_KEY,
  googleClientId: GOOGLE_CLIENT_ID,
  googleClientSecret: GOOGLE_CLIENT_SECRET,
  googleRefreshToken: GOOGLE_REFRESH_TOKEN,
  searchTerms: ["relevant", "keywords", "to-your", "product"],
});
```

Once this script is running, **BlahBlah** will:

1. Validate the provided configuration.
2. Periodically (once an hour) search for videos on YouTube that match your configured search terms.
3. Dynamically generate a comment using the OpenAI API and post it on each matched video.

## Configuration & Credentials

This section will guide you through setting up each credential step by step.

### 1. BlahBlah Project ID

1. Visit [blahblah.dev](https://blahblah.dev) and create an account.
2. Create a new project.
3. Copy your **Project ID**.
4. Set it as an **environment variable**:
   ```bash
   BLAHBLAH_PROJECT_ID=your-project-id
   ```

### 2. OpenAI API Key

1. Go to [OpenAI’s API Keys page](https://platform.openai.com/account/api-keys) (create an account if you don’t already have one), and make sure you top it up with some credits.
2. Generate a new secret key.
3. Copy your API key.
4. Set it as an **environment variable**:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   ```

### 3. Google Credentials

Before proceeding, **decide which Google/YouTube account you want to use for this task.** You may want to create a separate Google account specifically for this task to prevent any potential issues with your personal account (though there shouldn't be any, but it's safer).

To post comments via the YouTube Data API, follow these steps to set up a project in [Google Cloud Console](https://console.cloud.google.com/):

1. **Create a Google Cloud Project** (or select an existing project):

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click on **Select a project** (top-left) and choose **New Project**.
   - Enter a name, select a billing account if prompted, then click **Create**.

2. **Enable the YouTube Data API**:

   - In the Cloud Console, navigate to **APIs & Services** > **Library**.
   - Search for **YouTube Data API v3**.
   - Click **Enable**.

3. **Create OAuth consent screen** (if not already set up):

   - In **APIs & Services**, go to **OAuth consent screen** and click "Get Started".
   - Select **External**.
   - Add any required information (app name, support email, etc.) and save.

4. **Create OAuth Client ID & Client Secret**:
   - Go to **Credentials**.
   - Click **Create Credentials**, then **OAuth client ID**.
   - Select **Web application**.
   - Set the **Redirect URI** to:
     ```
     https://developers.google.com/oauthplayground
     ```
   - Click **Create**.
   - Copy the **Client ID** and **Client Secret**.
   - Set them as environment variables:
     ```bash
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     ```

5. Add your email as a test user

    - In the OAuth Consent Screen menu, navigate to "Audience".
    - Scroll down, and add your own email (yes yes, the one which owns this project) as a test user.

### 4. Generate the Refresh Token

To allow the script to post comments on your behalf (without manual user intervention every time), you need a **Refresh Token**.

1. **Use the Google OAuth Playground**:

   - Open [Google OAuth Playground](https://developers.google.com/oauthplayground).
   - Click on the gear icon and check `Use your own OAuth credentials`.
   - Paste in your **Client ID** and **Client Secret**.
   - Use the following **Scopes**:
     ```
     https://www.googleapis.com/auth/youtube.force-ssl
     ```
   - Click **Authorize APIs** and allow the required permissions.

2. **Exchange authorization code for tokens**:
   - Click **Exchange authorization code for tokens**.
   - Copy the **Refresh Token**.
   - Set it as an environment variable:
     ```bash
     export GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
     ```

## Additional Configuration

In addition to the required properties, **BlahBlah** also supports optional configurations, such as:

- `searchTerms`: An array of words to be used in the YouTube search for fetching relevant videos (required).
- `resultsPerJob`: The maximum number of YouTube results fetched per search.
- `publishTimeframe`: An object containing `min` and `max` (in minutes), indicating how recent the videos should be:

  ```javascript
  {
    publishTimeframe: {
      min: 30,
      max: 90
    }
  }
  ```

  In the configuration above, we will only be fetching videos which were posted between 30 and 90 minutes ago.

- `llmConfig`: If you wish to overwrite the AI instructions provided by BlahBlah, you can pass an object containing two fields:

  ```typescript
  interface LLMConfig {
    modelInstructions: string;
    prompt: string;
  }
  ```

- `openAiApiKey`: By default, BlahBlah uses the model `gpt-4o-mini-2024-07-18`, but you may pass a different model in order to override this.

## Troubleshooting

- **Invalid Script Config**: Ensure all required environment variables are set correctly.
- **Comment not posting**: Double-check that your **Refresh Token** is valid and that your credentials are correct. Also, ensure the YouTube Data API is enabled.
- **API Errors**: Check your usage and billing limits in both Google Cloud and OpenAI.
