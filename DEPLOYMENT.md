# Deployment Guide for ReLoop Anti

This guide will walk you through hosting your full stack application for **free** using Vercel (Frontend) and Supabase (Backend/Database).

## Prerequisites

1.  **GitHub Account**: To host your code.
2.  **Vercel Account**: For the frontend (can sign up with GitHub).
3.  **Supabase Account**: You are already using this, just ensure you have access to the dashboard.
    -   **Project Reference ID**: `epfywchxdenudzgfxtkw`

---

## Step 1: Push Code to GitHub

Since you have already initialized your git repository locally, follow these steps to push it to a cloud provider:

1.  Go to [GitHub.com](https://github.com) and create a **New Repository**.
    -   Name it `reloop-anti` (or similar).
    -   Make it **Public** or **Private** (Private is fine).
    -   **Do NOT** initialize with README, .gitignore, or License (you already have them).

2.  Run these commands in your terminal (replace `<your-username>` with your actual GitHub username):

    ```bash
    git remote add origin https://github.com/<your-username>/reloop-anti.git
    git branch -M main
    git push -u origin main
    ```

---

## Step 2: Deploy Frontend to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your `reloop-anti` repository and click **Import**.
4.  **Configure Project**:
    -   **Framework Preset**: It should auto-detect `Vite`.
    -   **Root Directory**: `./` (Default is fine).
5.  **Environment Variables**:
    You MUST add the variables from your local `.env` file here so the live site works.
    Expand the "Environment Variables" section and add:

    | Key | Value |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | `https://epfywchxdenudzgfxtkw.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | *(Copy the long key starting with `ey` from your local .env file)* |
    | `VITE_GEMINI_API_KEY` | `AIzaSyDY4sn5XIIvgiX-1sGtz5TpMXrS-I_A_o8` |

6.  Click **Deploy**.
    -   Wait 1-2 minutes. Once done, you will get a public URL (e.g., `https://reloop-anti.vercel.app`).

---

## Step 3: Deploy Edge Functions to Supabase

Your project uses Supabase Edge Functions (`verify-component` and `estimate-value-inr`) for AI logic. These need to be deployed to the cloud manually.

1.  **Install Supabase CLI** (if not already installed):
    ```bash
    npm install -g process supabase
    # OR using npx directly as below
    ```

2.  **Login to Supabase**:
    ```bash
    npx supabase login
    ```
    -   This will open your browser. Click "Confirm".

3.  **Deploy Functions**:
    Run the following command to deploy all functions to your specific project:

    ```bash
    npx supabase functions deploy --project-ref epfywchxdenudzgfxtkw
    ```

    -   If asked "Do you want to run Deno?", say **Yes** (or it might auto-install).
    -   If asked to link the project, say **Yes** (Enter project ID `epfywchxdenudzgfxtkw` if prompted).

**Note:** We have temporarily hardcoded the Gemini API Key inside the functions for easier deployment. In a production environment, you would typically use `supabase secrets set`.

---

## Step 4: Final Verification

1.  Open your **Vercel URL**.
2.  Go to the **Leaderboard** (Reads from DB).
3.  Go to a **Teardown Session** and try to verify a component (Uses `verify-component` Edge Function).
    -   If the AI verification works, your Edge Functions are correctly deployed!

## Troubleshooting

-   **White Screen on Vercel?** Check the "Logs" tab in Vercel. Ensure all Environment Variables are correct.
-   **Verification Fails?** Check Supabase Dashboard -> Edge Functions -> Logs for `verify-component`.
