# Multi-Chain Crypto Indexer & Dashboard 🚀

A professional, self-hosted blockchain explorer and transaction indexer for **Ethereum** and **Bitcoin**. This application scans blocks in real-time, stores data in a local database, and provides a premium dashboard for monitoring network activity.

## 🏗️ Architecture Overview

The application follows a modern, decoupled architecture designed for high performance and data persistence.

```
┌─────────────┐       ┌─────────────┐       ┌────────────────┐
│   React     │ <───> │   Express   │ <───> │   SQLite (DB)  │
│  Frontend   │       │   Backend   │       │   via Prisma   │
└─────────────┘       └─────┬───────┘       └────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │      Cron Indexers        │
              │  (Background Services)    │
              └─────────────┬─────────────┘
                    ┌───────┴───────┐
              ┌───────▼──────┐  ┌──────▼───────┐
              │ Ethereum     │  │ Bitcoin      │
              │ (Viem + RPC) │  │ (JSON-RPC)   │
              └──────────────┘  └──────────────┘
```

- **Background Sync**: Dedicated cron jobs sync the latest blocks for both ETH and BTC.
- **Data Persistence**: Uses Prisma ORM with SQLite for local, zero-config data storage.
- **Premium Dashboard**: Real-time feeds for blocks and global network activity.
- **Secure**: All RPC keys are isolated on the backend.

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Alchemy API Key** (for ETH) - [alchemy.com](https://www.alchemy.com/)
- **Bitcoin RPC Node** (Optional) - Default uses a public node.

### 2. Environment Configuration
From the project root, create a `.env` file:
```bash
cp .env.example .env
```
Update the `.env` file with your credentials:
```env
# Ethereum Configuration
ALCHEMY_API_KEY=your_alchemy_key_here
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here

# Bitcoin Configuration
BTC_RPC_URL=https://bitcoin-rpc.publicnode.com

# Server Configuration
PORT=5000
```

### 3. Installation & Database Setup
Install dependencies and initialize the database:

**Backend:**
```bash
cd server
npm install
npx prisma db push
```

**Frontend:**
```bash
cd ../client
npm install
```

---

## 🎯 Running the Application

You need two terminal windows to run the full stack.

### Terminal 1: Start Backend (Indexer + API)
```bash
cd server
npm run dev
```
This starts the Express server on port 5000 and activates the ETH/BTC background scanners.

### Terminal 2: Start Frontend
```bash
cd client
npm start
```
The dashboard will open automatically at `http://localhost:3000`.

---

## 📖 Key Features

### 📊 Dashboard View
- **Multi-Chain Toggle**: Switch between Ethereum and Bitcoin with one click.
- **Live Block Feed**: See blocks as they are confirmed on-chain.
- **Global Activity Stream**: Watch a real-time feed of all transactions being processed globally.
- **Explorer Links**: Click any block or transaction hash to view it on Etherscan or Blockstream.

### 🔍 Search Deep-Dive
- Paste any wallet address to see its full local transaction history.
- Smart detection for ETH vs BTC address formats.

### 🛠️ Developer Tools
- **Prisma Studio**: View and edit the database records visually.
  ```bash
  cd server
  npx prisma studio
  ```

---

## 🔧 Project Structure

- `server/`: Express API and Prisma schema.
- `server/indexer/`: Background sync services (Cron jobs).
- `client/src/App.js`: Main Dashboard logic and state management.
- `client/src/styles/App.css`: Premium Glassmorphism styling.

---

## 🤝 Troubleshooting
- **Port 5000 In Use**: Run `fuser -k 5000/tcp` to clear previously running instances.
- **No Data Appearing**: Check your `.env` for valid RPC URLs and ensure `npx prisma db push` was run.
- **Rate Limits**: If using free-tier RPCs, data might sync slower or encounter intermittent errors.

---

**Built for performance and privacy as a self-hosted blockchain indexing solution.**
