# Tybox 📦

A full-stack TypeScript sandbox project featuring a React frontend, Express backend, and Docker-based infrastructure with PostgreSQL, Redis, WireMock, and Prisma ORM.

## 🚀 Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Start PostgreSQL (or all services)
./bin/start.sh postgres  # or just ./bin/start.sh for all services

# 3. Run both frontend and backend
yarn dev:all

# Visit:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
```

## 📋 Prerequisites

- Node.js (v18+)
- Yarn
- Docker & Docker Compose
- PostgreSQL client tools (optional, for debugging)

## 🎨 Features

### Frontend (React + Vite)

- **Modern React** with TypeScript and Vite for fast development
- **Quote Display** - Shows random inspirational quotes from the backend API
- **Responsive Design** - Beautiful gradient UI that works on all devices
- **Error Handling** - Graceful error states with retry functionality
- **Hot Module Replacement** - Instant updates during development

### Backend (Express + TypeScript)

- **RESTful API** - Quote endpoints with full CRUD operations
- **CORS Enabled** - Configured for frontend communication
- **Database Ready** - Prisma ORM with PostgreSQL integration
- **Monitoring** - Request metrics and logging with Winston
- **Queue Support** - Redis integration with BullMQ

## 🏗️ Infrastructure

### Docker Services

The project includes a Docker Compose setup with:

- **PostgreSQL** (port 5432) - Primary database
- **Redis** (port 6379) - Caching and queues
- **WireMock** (port 8080) - API mocking

### Service Management Scripts

```bash
# Start all services
./bin/start.sh

# Start specific services
./bin/start.sh postgres
./bin/start.sh postgres redis
./bin/start.sh postgres redis wiremock

# Stop all services
./bin/down.sh

# Stop specific services
./bin/down.sh redis
./bin/down.sh postgres wiremock
```

Scripts features:

- ✅ Health checks for all services
- ✅ Colored output for better visibility
- ✅ Service URLs displayed on startup
- ✅ Individual service control

## 🗄️ Database (Prisma)

### Configuration

Database connection is configured in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tybox?schema=public"
```

Note: When running the app in Docker, use `host.docker.internal` instead of `localhost`.

### Schema

The project includes example models:

- **User** - User accounts with profiles
- **Profile** - User bio and avatar
- **Post** - Blog posts with categories and tags
- **Category** & **Tag** - Content organization

### Database Commands

```bash
# Generate Prisma Client
yarn prisma:generate

# Create/update database schema (development)
yarn prisma:migrate

# Apply migrations (production)
yarn prisma:migrate:prod

# Open Prisma Studio (GUI)
yarn prisma:studio

# Seed database with example data
yarn prisma:seed

# One-command setup (start DB, migrate, seed)
yarn db:setup
```

### Automatic Migration

The server automatically applies migrations on startup:

1. **Development Mode** (`yarn dev`)
   - Creates and applies migrations interactively
   - Generates Prisma Client
   - Shows detailed logs

2. **Production Mode** (`NODE_ENV=production`)
   - Applies pending migrations only
   - Minimal logging
   - Exits on migration failure

3. **Scripts with Migration**

   ```bash
   yarn dev:migrate      # Dev with auto-migration
   yarn start:migrate    # Production with migration
   ```

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn dev              # Start backend only
yarn dev:frontend     # Start frontend only
yarn dev:backend      # Start backend only
yarn dev:all          # Start both frontend and backend
yarn dev:migrate      # Start with migrations

# Building
yarn build            # Build both frontend and backend
yarn build:backend    # Build backend only
yarn build:frontend   # Build frontend only
yarn start            # Run compiled backend
yarn preview          # Preview built frontend

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint issues
yarn format           # Format with Prettier

# Database
yarn prisma:generate  # Generate Prisma Client
yarn prisma:migrate   # Create/apply migrations
yarn prisma:studio    # Open database GUI
yarn prisma:seed      # Run example data seeding
```

### Project Structure

```
tybox/
├── bin/
│   ├── start.sh          # Start Docker services
│   └── down.sh           # Stop Docker services
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   ├── App.css       # Application styles
│   │   └── main.tsx      # React entry point
│   ├── index.html        # HTML template
│   └── package.json      # Frontend dependencies
├── prisma/
│   └── schema.prisma     # Database schema
├── src/                  # Backend application
│   ├── config/           # Configuration
│   ├── generated/
│   │   └── prisma/       # Generated Prisma Client
│   ├── lib/
│   │   └── database.ts   # Database initialization
│   ├── middlewares/      # Express middlewares
│   ├── routes/
│   │   ├── quotes.ts     # Quote API endpoints
│   │   └── index.ts      # Route aggregator
│   ├── index.ts          # Backend entry point
│   └── prisma-example.ts # Prisma usage examples
├── docker-compose.yml    # Docker services configuration
├── vite.config.ts        # Vite configuration
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## 💻 Usage Examples

### API Endpoints

```bash
# Get a random quote
curl http://localhost:4000/v1/quotes/random

# Get all quotes
curl http://localhost:4000/v1/quotes

# Get specific quote by ID
curl http://localhost:4000/v1/quotes/1
```

### Frontend Features

- Visit <http://localhost:3000> to see the Quote App
- Click "Get New Quote" for random inspirational quotes
- Fully responsive design with gradient animations
- Error handling with retry functionality

### Using Prisma in Your Code

```typescript
import { getPrismaClient } from './lib/database';

const prisma = getPrismaClient();

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    profile: {
      create: {
        bio: 'Developer',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    }
  }
});

// Query with relations
const posts = await prisma.post.findMany({
  where: { published: true },
  include: {
    author: true,
    tags: true,
    categories: true
  }
});

// Transaction
const [postCount, userCount] = await prisma.$transaction([
  prisma.post.count(),
  prisma.user.count(),
]);
```

### Running the Example

```bash
# Make sure PostgreSQL is running
./bin/start.sh postgres

# Run the example script
yarn prisma:seed
```

This will:

- Create sample users, posts, categories, and tags
- Demonstrate CRUD operations
- Show complex queries and relations
- Display transaction examples

## 🔧 Environment Variables

```env
# Server
PORT=4000

# Frontend Dev Server
VITE_PORT=3000

# Redis
REDIS_HOST="localhost"  # or "host.docker.internal" when running app in Docker
REDIS_PORT=6379
REDIS_TIMEOUT=1000

# PostgreSQL
POSTGRES_HOST="localhost"  # or "host.docker.internal" when running app in Docker
POSTGRES_PORT=5432
DATABASE_NAME=tybox
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tybox?schema=public&connection_limit=10"

# WireMock
WIREMOCK_HOST="localhost"  # or "host.docker.internal" when running app in Docker
WIREMOCK_PORT=8080
```

## 📝 Tips

1. **Database Migrations**: Always run after schema changes

   ```bash
   yarn prisma:migrate
   ```

2. **Type Safety**: Prisma Client is fully typed
   - Auto-completion for all models and fields
   - Type-safe queries and mutations

3. **Prisma Studio**: Visual database editor

   ```bash
   yarn prisma:studio
   ```

   Opens at <http://localhost:5555>

4. **Docker Cleanup**: Remove volumes to reset data

   ```bash
   docker-compose down -v
   ```

5. **Connection Issues**: Ensure PostgreSQL is running

   ```bash
   docker ps  # Check running containers
   ./bin/start.sh postgres  # Restart PostgreSQL
   ```

## 🐛 Troubleshooting

### Frontend Issues

- **Vite not starting**: Check port 3000 is free: `lsof -i :3000`
- **API calls failing**: Ensure backend is running on port 4000
- **CORS errors**: Check CORS configuration in `src/index.ts`

### Backend Issues

- **Nodemon restart loop**: Check `nodemon.json` excludes generated files
- **Port already in use**: Kill process: `lsof -i :4000 | grep LISTEN`

### Migration Fails

- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in `.env`
- Try manual migration: `yarn prisma:migrate`

### Connection Refused

- Ensure Docker services are up: `./bin/start.sh`
- Check port conflicts: `lsof -i :5432`
- Verify host (`localhost` vs `host.docker.internal`)

### Prisma Client Not Found

- Generate client: `yarn prisma:generate`
- Check output path in `schema.prisma`
- Rebuild: `yarn build`

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose](https://docs.docker.com/compose/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 📄 License

ISC
