# Tybox 📦

A TypeScript sandbox project with Docker-based infrastructure including PostgreSQL, Redis, WireMock, and Prisma ORM.

## 🚀 Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Start PostgreSQL (or all services)
./bin/start.sh postgres  # or just ./bin/start.sh for all services

# 3. Run the server (migrations apply automatically)
yarn dev
```

## 📋 Prerequisites

- Node.js (v18+)
- Yarn
- Docker & Docker Compose
- PostgreSQL client tools (optional, for debugging)

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
yarn dev              # Start dev server with nodemon
yarn dev:migrate      # Start with migrations

# Building
yarn build            # Generate Prisma Client & compile TypeScript
yarn start            # Run compiled JavaScript
yarn start:migrate    # Run with migrations

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
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── config/           # Configuration
│   ├── generated/
│   │   └── prisma/       # Generated Prisma Client
│   ├── lib/
│   │   └── database.ts   # Database initialization
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API routes
│   ├── index.ts          # Application entry point
│   └── prisma-example.ts # Prisma usage examples
├── docker-compose.yml    # Docker services configuration
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## 💻 Usage Examples

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

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_TIMEOUT=1000

# PostgreSQL
POSTGRES_HOST="localhost"
POSTGRES_PORT=5432
DATABASE_NAME=tybox
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tybox?schema=public"

# WireMock
WIREMOCK_HOST="localhost"
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
   Opens at http://localhost:5555

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

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose](https://docs.docker.com/compose/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 📄 License

ISC
