# Multi-Chain Crypto Indexer & Dashboard 🚀

A professional, self-hosted blockchain explorer and transaction indexer for **Ethereum** and **Bitcoin**. This application scans blocks in real-time, stores data in PostgreSQL, provides Redis caching, and offers a premium dashboard for monitoring network activity.

## 🏗️ Architecture Overview

The application follows a modern, decoupled architecture designed for high performance and data persistence.

```
┌─────────────┐       ┌─────────────┐       ┌────────────────┐
│   React     │ <──── │   Express   │ <──── │  PostgreSQL    │
│  Frontend   │       │   Backend   │       │   via Prisma   │
└─────────────┘       └─────┬───────┘       └────────────────┘
                            │                      ▲
                      ┌─────┴─────┐                │
                      │   Redis   │ (Caching)      │
                      └───────────┘                │
              ┌─────────────┴─────────────┐        │
              │      Cron Indexers        │────────┘
              │  (Background Services)    │
              └─────────────┬─────────────┘
                    ┌───────┴───────┐
              ┌───────▼──────┐  ┌──────▼───────┐
              │ Ethereum     │  │ Bitcoin      │
              │ (Viem + RPC) │  │ (JSON-RPC)   │
              └──────────────┘  └──────────────┘
```

- **Background Sync**: Dedicated cron jobs sync the latest blocks for both ETH and BTC.
- **Data Persistence**: Uses Prisma ORM with PostgreSQL for robust data storage.
- **Redis Caching**: API responses are cached for improved performance.
- **Wallet Search**: Search any wallet address and view transaction details in-app.
- **Secure**: All RPC keys are isolated on the backend.

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **Alchemy API Key** (for ETH) - [alchemy.com](https://www.alchemy.com/)
- **Bitcoin RPC Node** (Optional) - Default uses a public node.

### 2. Start Database Services (Docker)
Start PostgreSQL and Redis using Docker Compose:
```bash
docker-compose up -d
```
This starts:
- **PostgreSQL** on port `5432` (user: `postgres`, password: `postgres123`, db: `crypto_indexer`)
- **Redis** on port `6379`

To stop the services:
```bash
docker-compose down
```

### 3. Environment Configuration
From the project root, create a `.env` file:
```bash
cp .env.example .env
```
Update the `.env` file with your credentials:
```env
# Ethereum Configuration
ALCHEMY_API_KEY=your_alchemy_key_here

# Bitcoin Configuration
BTC_RPC_URL=https://bitcoin-rpc.publicnode.com

# PostgreSQL Database (Docker)
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/crypto_indexer

# Redis Caching (Docker)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=5000
```

### 4. Installation & Database Setup
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
