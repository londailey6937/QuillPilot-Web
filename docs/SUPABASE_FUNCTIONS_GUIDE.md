# Supabase Edge Functions Setup Guide

This guide explains how to move your proprietary analysis logic to Supabase Edge Functions to protect your intellectual property.

## 1. Prerequisites

You need the Supabase CLI installed on your machine.

**macOS:**

```bash
brew install supabase/tap/supabase
```

**Windows (Scoop):**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## 2. Login and Link

1.  **Login** to Supabase from your terminal:

    ```bash
    supabase login
    ```

    (This will open your browser to authenticate).

2.  **Link** your local project to your remote Supabase project:
    ```bash
    supabase link --project-ref your-project-ref
    ```
    _You can find your Project Reference ID in the Supabase Dashboard under Project Settings > General._

## 3. Deploy the Function

We have created a sample function in `supabase/functions/analyze-concept`.

To deploy it to the cloud:

```bash
supabase functions deploy analyze-concept
```

## 4. Testing

Once deployed, you can use the "Server-Side Analysis Test" component we added to the bottom of your application to verify it works.

1.  Enter some text.
2.  Click "Run Secure Analysis".
3.  You should see a result returned from the server.

## 5. Next Steps (Migration)

To fully protect your app, we will need to:

1.  **Move Logic**: Copy the code from `src/components/LearningPrincipleEvaluators.ts` and `src/components/AnalysisEngine.ts` into the `supabase/functions/analyze-concept/index.ts` file.
2.  **Refactor**: Adapt the code to run in the Deno environment (mostly standard TypeScript, but some imports might need adjustment).
3.  **Update Client**: Update the frontend to call this function instead of running the analysis locally.

## Troubleshooting

- **CORS Errors**: If you see CORS errors, ensure the function handles the `OPTIONS` request (our sample code already does this).
- **Environment Variables**: If your function needs API keys (e.g., for OpenAI/Claude), set them using:
  ```bash
  supabase secrets set OPENAI_API_KEY=sk-xxx
  ```
