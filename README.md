# 🏗️ Node.js + Express + TypeScript — Production Starter Template

A clean, scalable, production-ready backend starter template designed for reuse across enterprise-level projects.

## ⚡ Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Start development server
npm run dev

# 4. Verify it works
curl http://localhost:5000/api/v1/health
```

## 📁 Project Structure

```
src/
├── app.ts                          # Express app configuration (middleware, routes)
├── server.ts                       # Server lifecycle (startup, shutdown, sockets)
│
├── common/                         # Shared types, constants, enums
│   ├── types.ts                    # Global TypeScript interfaces
│   └── constants.ts                # App-wide magic numbers & values
│
├── config/                         # Configuration & environment
│   ├── env.ts                      # Centralized environment variables
│   ├── logger.ts                   # Pino logger setup
│   └── database.ts                 # Database connection
│
├── middlewares/                     # Express middleware
│   ├── auth.middleware.ts           # JWT authentication
│   ├── authorization.middleware.ts  # Role-based access control
│   ├── validator.middleware.ts      # Zod request validation
│   ├── limiter.middleware.ts        # Rate limiting
│   ├── error.middleware.ts          # Global error handler
│   └── request-logger.middleware.ts # HTTP request logging
│
├── modules/                        # Feature modules (domain-driven)
│   ├── auth/                       # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.route.ts
│   │   ├── auth.validator.ts
│   │   ├── auth.dto.ts
│   │   ├── auth.type.ts
│   │   └── auth.model.ts
│   ├── user/                       # User management module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.route.ts
│   │   ├── user.validator.ts
│   │   ├── user.dto.ts
│   │   ├── user.type.ts
│   │   └── user.model.ts
│   └── health/                     # Health check endpoint
│       └── health.route.ts
│
├── utils/                          # Reusable utilities
│   ├── bcrypt.ts                   # Password hashing
│   ├── jwt.ts                      # JWT sign/verify
│   ├── crypto.ts                   # AES encryption
│   ├── create-otp.ts               # Secure OTP generation
│   ├── decode-token.ts             # JWT decode (without verify)
│   ├── error/                      # Error classes & handlers
│   │   ├── app.error.ts            # AppError + subclasses
│   │   ├── async-handler.ts        # Async route wrapper
│   │   ├── error-handler.ts        # Non-Express error handler
│   │   └── not.found.error.ts      # 404 route handler
│   ├── response/                   # API response helpers
│   │   ├── http-status-code.ts     # HTTP status constants
│   │   └── response-handler.ts     # Standardized response builder
│   ├── cloudinary/                 # Cloud image uploads
│   ├── multer/                     # File upload config
│   ├── send-email/                 # Email service
│   ├── socketio/                   # Socket.IO setup
│   └── paymob/                     # Payment integration
│
├── jobs/                           # Scheduled cron jobs
│   └── job1.node.cron.ts
│
└── tests/                          # Test files
```

## 🏛️ Architecture Decisions

### Why separate `app.ts` and `server.ts`?
- **app.ts** contains Express configuration — middleware, routes, error handlers
- **server.ts** handles server lifecycle — startup, shutdown, socket.io, cron jobs
- This separation allows **integration tests** to import `app` without starting an HTTP server

### Why modules instead of flat routes?
Each feature is self-contained with its own controller, service, route, validator, DTO, type, and model:
```
Route → Middleware → Controller → Service → Model
```
- **Controller**: Thin HTTP layer — extracts req data, calls service, sends response
- **Service**: Business logic — framework-agnostic, testable without Express
- **Model**: Data persistence — ORM/ODM interactions
- **Validator**: Zod schemas for runtime validation + TypeScript inference
- **DTO**: Data transformation — prevents leaking internal fields to clients

### Why AppError class hierarchy?
- `isOperational` flag distinguishes expected errors (bad input) from bugs (null pointer)
- Subclasses (`NotFoundError`, `UnauthorizedError`, etc.) provide semantic clarity
- The global error handler uses `instanceof` checks for type-safe error formatting

### Why centralized `env.ts`?
- Single source of truth for all environment variables
- Type-safe access with computed getters (`env.isDevelopment`)
- Easy to mock in tests — swap one import instead of stubbing `process.env`

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run lint` | Type-check without emitting files |

## 🔒 Security Features

- **Helmet** — Sets security HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — Configurable origin whitelist with preflight caching
- **Rate Limiting** — Global + strict per-route (auth endpoints: 10 req/15min)
- **JWT** — Separate access/refresh tokens with different secrets
- **Password Hashing** — bcrypt with 12 salt rounds
- **Input Validation** — Zod schemas on body, params, and query
- **Error Sanitization** — Stack traces hidden in production
- **Log Redaction** — Sensitive fields (passwords, tokens) auto-redacted from logs

## 🧩 Adding a New Module

1. Create folder: `src/modules/your-module/`
2. Create files following the naming convention:
   ```
   your-module.controller.ts
   your-module.service.ts
   your-module.route.ts
   your-module.validator.ts
   your-module.dto.ts
   your-module.type.ts
   your-module.model.ts
   ```
3. Register the route in `src/app.ts`:
   ```typescript
   import yourModuleRoutes from "./modules/your-module/your-module.route.js";
   app.use(`${API_PREFIX}/your-module`, yourModuleRoutes);
   ```

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| TypeScript | Type safety |
| Zod | Runtime validation |
| Pino | Structured logging |
| JWT | Authentication |
| bcrypt | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin handling |
| express-rate-limit | Rate limiting |
| Multer | File uploads |
| Nodemailer | Email sending |
| Socket.IO | Real-time communication |
| node-cron | Scheduled tasks |
| Cloudinary | Cloud image storage |
| Stripe | Payment processing |
| Redis | Caching & sessions |
| AWS SDK | Cloud services |

## 📜 License

ISC
