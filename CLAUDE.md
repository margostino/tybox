# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start

```bash
# Start database and run development servers
yarn db:setup          # Start PostgreSQL, run migrations, and seed data
yarn dev:all           # Run both frontend and backend concurrently
```

### Development

```bash
yarn dev               # Backend only with hot reload (port 4000)
yarn dev:frontend      # Frontend only (port 3000)
yarn dev:backend       # Backend only
yarn dev:migrate       # Backend with auto-migration
```

### Database Operations

```bash
yarn prisma:generate   # Generate Prisma Client after schema changes
yarn prisma:migrate    # Create and apply migrations (development)
yarn prisma:studio     # Open Prisma Studio GUI at localhost:5555
yarn prisma:seed       # Run backend/prisma-example.ts to seed database
```

### Code Quality

```bash
yarn lint              # Run ESLint on backend/**/*.ts
yarn lint:fix          # Auto-fix ESLint issues
yarn format            # Format code with Prettier
```

### Docker Services

```bash
./bin/start.sh         # Start all services (PostgreSQL, Redis, WireMock)
./bin/start.sh postgres # Start specific service(s)
./bin/down.sh          # Stop all services
```

### Build & Production

```bash
yarn build             # Build both frontend and backend
yarn start             # Run compiled backend
yarn start:migrate     # Production with migrations
```

## Architecture

### Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
  - Development server on port 3000
  - Proxy configuration for `/v1` routes to backend
  - Built output to `dist-frontend/`

- **Backend**: Express 5 + TypeScript + Prisma ORM
  - API server on port 4000
  - Automatic database migrations on startup
  - Winston logging + Prometheus metrics
  - Redis integration with BullMQ for queuing

- **Database**: PostgreSQL with Prisma ORM
  - Models: User, Profile, Post, Category, Tag, Quote
  - Generated client in `backend/generated/prisma/`
  - Migrations in `prisma/migrations/`

### Key Architectural Patterns

1. **Database Access**: Centralized through `backend/lib/database.ts`
   - `getPrismaClient()` returns singleton instance
   - Automatic migration handling based on NODE_ENV
   - Connection pooling configured in DATABASE_URL

2. **API Structure**: Modular route organization
   - Routes defined in `backend/routes/`
   - Middleware stack: CORS → JSON parsing → metrics → routes → error handler
   - Quote API endpoints at `/v1/quotes`

3. **Frontend Components**:
   - `App.tsx`: Main application with quote display
   - `QuoteManager.tsx`: CRUD operations for quotes
   - API calls use fetch with proper error handling

4. **Configuration Management**:
   - Environment variables in `.env`
   - TypeScript config with strict mode enabled
   - ESLint with TypeScript and Prettier integration

### Important Implementation Details

- **CORS**: Configured for localhost:3000 and localhost:5173
- **TypeScript**: Strict mode enabled with no implicit any warnings
- **Prisma Output**: Custom output path `../backend/generated/prisma`
- **Nodemon**: Watches backend files, ignores generated code
- **Database Migrations**: Automatic in development, manual in production
- **Error Handling**: Global error handler middleware in place

## Working with Prisma

When modifying database schema:

1. Edit `prisma/schema.prisma`
2. Run `yarn prisma:migrate` to create migration
3. Run `yarn prisma:generate` to update TypeScript types
4. Import from `backend/generated/prisma` in code

## Frontend Development

- Vite dev server proxies `/v1` requests to backend
- React components use CSS modules for styling
- Error boundaries implemented for graceful error handling
- Responsive design with gradient animations

## Backend Patterns

- Request/response logging via Winston
- Prometheus metrics collection enabled
- Zod schemas for input validation (in `backend/schemas/`)
- Custom exceptions in `backend/exceptions/`
- Database initialization with retry logic
