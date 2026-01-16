# 🐙 Step-by-Step: Upload to GitHub & Make Public

Follow this guide to host your **Crypto Indexer** on GitHub and share it with the world.

## 👨‍💻 Step 1: Create a Repository on GitHub

1.  Log in to [github.com](https://github.com).
2.  Click the **+** icon in the top right and select **New repository**.
3.  **Repository name**: Give it a name (e.g., `crypto-indexer-dashboard`).
4.  **Description**: (Optional) `Self-hosted Multi-Chain Blockchain Explorer`.
5.  **Public/Private**: Select **Public**.
6.  **Initialize**: Do **NOT** check "Initialize this repository with a README, .gitignore, or license" (we already have these).
7.  Click **Create repository**.

---

## 💻 Step 2: Initialize Git Locally

Open your terminal in the root of your project (`/data/Task`) and run:

```bash
# 1. Initialize git
git init

# 2. Add all files
# (Don't worry, .gitignore will filter out your .env and node_modules)
git add .

# 3. Create initial commit
git commit -m "Initial commit: Multi-chain crypto dashboard"
```

---

## 🔗 Step 3: Link to GitHub & Push

Copy the commands from the "push an existing repository" section on your GitHub page, or run:

```bash
# 1. Select the main branch
git branch -M main

# 2. Add your GitHub repo as a remote
# REPLACE [your-username] and [repo-name] with your actual info
git remote add origin https://github.com/[your-username]/[repo-name].git

# 3. Push to GitHub
git push -u origin main
```

---

## ⚠️ Important Security Checklist

Before you push, double-check these two things to keep your API keys safe:

1.  **Check .gitignore**: Run `git status`. You should **NOT** see `.env` or `dev.db` in the list of "new files."
2.  **Environment Example**: Ensure you have pushed `.env.example` but **NOT** `.env`.

---

## 🌍 Step 4: Verify Public Access

1.  Go to your repository settings on GitHub.
2.  Under **General**, scroll down to **Visibility**.
3.  It should say "This repository is currently **Public**."

**Congratulations! Your code is now live on GitHub.** 🎉
