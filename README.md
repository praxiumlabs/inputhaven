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

- **Web**: http://localhost:3002
- **API**: http://localhost:3001
- **MailHog**: http://localhost:8025
- **MinIO Console**: http://localhost:9003

## 🔧 Port Configuration

| Service | Port |
|---------|------|
| Next.js Frontend | 3002 |
| Hono API | 3001 |
| PostgreSQL | 5433 |
| Redis | 6380 |
| MinIO API | 9002 |
| MinIO Console | 9003 |
| MailHog SMTP | 1025 |
| MailHog Web | 8025 |

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

## 🛠️ Scripts

```bash
# Development
npm run dev           # Start all apps in dev mode
npm run build         # Build all apps

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:studio     # Open Prisma Studio
npm run db:migrate    # Run migrations

# Docker
npm run docker:up     # Start Docker services
npm run docker:down   # Stop Docker services
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and update the values:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `OPENAI_API_KEY` - For AI features (optional)
- `STRIPE_SECRET_KEY` - For billing (optional)

Built with ❤️
