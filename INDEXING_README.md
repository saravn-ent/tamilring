
# 🚀 Google Indexing Setup Guide

To get all your 1000+ pages indexed immediately, follow these steps:

## Step 1: Get Google Cloud Service Account Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select existing).
3. Enable the **"Web Search Indexing API"**.
4. Go to **IAM & Admin > Service Accounts**.
5. Create a Service Account.
6. Click on the created account > **Keys** > **Add Key** > **Create New Key** > **JSON**.
7. Save the downloaded file as `service_account.json` in this project's root folder (`d:\websites\tamilring\service_account.json`).

## Step 2: Grant Access in Search Console
1. Open the `service_account.json` file and copy the `client_email` address.
2. Go to [Google Search Console](https://search.google.com/search-console).
3. Select your property (`https://tamilring.in/`).
4. Go to **Settings > Users and permissions**.
5. Click **Add User** -> Paste the email -> Permission: **Owner**.

## Step 3: Run the Indexing Script
Run this command in your terminal:

```bash
node scripts/index-now.js
```

This will automatically fetch all your ringtones from Supabase and submit them to Google for instant crawling.

## Troubleshooting
- If you see `403 Forbidden`, ensure you added the service account email as an **Owner** in Search Console.
- If you see `429 Quota Exceeded`, wait a few hours. The default quota is ~200 per day.
