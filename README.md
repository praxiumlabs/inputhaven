# 📥 InputHaven v2.0

Modern form backend platform with AI-powered features, real-time notifications, and seamless integrations.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Hono, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Cache** | Redis |
| **Storage** | S3-compatible (MinIO for local) |
| **AI** | OpenAI GPT-4 |

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose

## 🏁 Quick Start

### 1. Install Dependencies

```bash
cd inputhaven-v2
npm install
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Setup Database

```bash
cp .env.example .env
npm run db:generate
npm run db:push
```

### 4. Run Development

```bash
npm run dev
```

### 5. Access

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **MailHog**: http://localhost:8025
- **MinIO**: http://localhost:9001

## 📁 Structure

```
inputhaven-v2/
├── apps/
│   ├── api/          # Hono API
│   └── web/          # Next.js frontend
├── packages/
│   └── database/     # Prisma schema
├── docker-compose.yml
└── package.json
```

Built with ❤️
