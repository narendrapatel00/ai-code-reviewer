# Deployment Guide: AI Code Reviewer

This guide walks you through deploying the **AI Code Reviewer** application to production using **Vercel** (for Next.js frontend hosting) and **Supabase** (for the PostgreSQL database, Authentication, and Row Level Security).

---

## Prerequisites
* **GitHub Account**: Your repository is pushed to [github.com/narendrapatel00/ai-code-reviewer](https://github.com/narendrapatel00/ai-code-reviewer).
* **Supabase Account**: Sign up at [supabase.com](https://supabase.com).
* **Groq Account**: Sign up for a Groq Cloud account at console.groq.com and generate an API key.
* **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.

---

## Step 1: Set Up Supabase Database & Auth

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Select your Organization, enter a project Name (e.g., `ai-code-reviewer`), set a secure Database Password, and select the region closest to your users.
3. Wait a couple of minutes for the database to finish provisioning.
4. From the left sidebar, select **SQL Editor** (icon looking like `>_`).
5. Click **New Query**.
6. Open your project's [schema.sql](file:///c:/Users/Narendra/OneDrive/Desktop/Ai%20code%20reviewer/supabase/schema.sql) file, copy its entire contents, and paste them into the SQL Editor.
7. Click the **Run** button at the top-right of the SQL editor.
   * This query creates the public tables (`users`, `reviews`, `review_findings`, `prompts`, `api_usage`, `favorites`).
   * It enables Row Level Security (RLS) policies.
   * It configures a Postgres trigger that automatically copies user profiles from `auth.users` to `public.users` when a user signs up.

---

## Step 2: Set Up Vercel Project

1. Log into your [Vercel Dashboard](https://vercel.com) and click **Add New...** -> **Project**.
2. Under **Import Git Repository**, choose your GitHub account and click **Import** next to the `ai-code-reviewer` repository.
3. In the project configuration step, expand the **Environment Variables** section and add the following keys from your Supabase and Groq settings:

| Environment Variable | Description / Value Source |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase -> Project Settings -> API -> Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase -> Project Settings -> API -> `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> Project Settings -> API -> `service_role` secret key |
| `GROQ_API_KEY` | Groq Console -> API Keys |
| `NEXT_PUBLIC_APP_URL` | Your Vercel production URL (e.g., `https://ai-code-reviewer-three.vercel.app` - you can update this after deployment if needed) |
| `NEXT_PUBLIC_SITE_URL` | Same as `NEXT_PUBLIC_APP_URL` (used for authentication redirects) |

4. Click **Deploy**. Vercel will clone the code, compile the Next.js production build, and serve your app.

---

## Step 3: Configure Redirect URLs in Supabase

Next.js Auth (Supabase Auth Helper) needs authorization parameters matching your production URL:

1. Copy the production URL of your newly deployed Vercel application.
2. Go to your **Supabase Dashboard** and click **Authentication** -> **URL Configuration**.
3. Under **Site URL**, paste your Vercel production URL (e.g., `https://your-app.vercel.app`).
4. Under **Redirect URLs**, click **Add URL** and input:
   ```
   https://your-app.vercel.app/auth/callback
   ```
   *(Be sure to replace `https://your-app.vercel.app` with your actual Vercel domain)*.
5. Click **Save**.

---

## Step 4: Setup OAuth Providers (Optional)

If you plan to use **Sign in with GitHub** or **Sign in with Google** buttons in the app:
1. In the **Supabase Dashboard**, navigate to **Authentication** -> **Providers**.
2. Scroll to **GitHub** (or **Google**), toggle it on, and copy the **Callback URL** provided there.
3. Register an OAuth App in GitHub Developer Settings (or Google Cloud Console Credentials) and configure the Authorization Callback URL with the URL you copied.
4. Input the generated **Client ID** and **Client Secret** into the Supabase Provider settings and click **Save**.

---

## Verification
1. Navigate to your Vercel deployment URL.
2. Register a new user account.
3. Verify that you are redirected to the Dashboard successfully.
4. Paste a code snippet, run a review, and verify that findings and reviews are saved and displayed correctly.
