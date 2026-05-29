import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./DB/database.js";
import { SocketManager } from "./shared/utils/socketio/socketio.js";
import { registerJobs } from "./shared/jobs/register.jobs.js";

/**
 * Server entry point.
 *
 * Separation of app.ts and server.ts:
 * - app.ts: Express configuration (middleware, routes) — testable without starting HTTP server
 * - server.ts: Server lifecycle (startup, shutdown, connections) — infrastructure concerns
 *
 * This separation allows integration tests to import `app` directly
 * without binding to a port.
 */

const server = http.createServer(app);

// ========================
// Socket.IO
// ========================
export const io = new SocketManager({
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
  logger,
  // authHandler: async (socket) => {
  //   const token =
  //     socket.handshake.auth?.token ||
  //     socket.handshake.headers?.authorization;
  //   if (!token) throw new Error("Authentication required");
  //   const decoded = decodeToken(token); // your auth logic
  //   return { userId: decoded.id, role: decoded.role };
  // },
});

io.attach(server);

// Register project-specific socket handlers:
// io.onConnection((socket, server) => {
//   registerChatEvents(socket, io);
//   registerOrderEvents(socket, io);
// });

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Register cron jobs
    registerJobs();

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(
        `📍 Health check: http://localhost:${env.PORT}/api/v1/health`,
      );
    });
  } catch (error) {
    logger.fatal(error, "Failed to start server");
    process.exit(1);
  }
};

// ========================
// Graceful Shutdown
// ========================

/**
 * Graceful shutdown handler.
 *
 * When the process receives SIGINT (Ctrl+C) or SIGTERM (Docker stop, Kubernetes, PM2):
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete
 * 3. Close database connections
 * 4. Exit cleanly
 *
 * Without this, active requests would be dropped mid-response,
 * database connections would leak, and data corruption is possible.
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(() => {
    logger.info("HTTP server closed");

    // Close database connection here:
    // await mongoose.connection.close();
    // await prisma.$disconnect();

    logger.info("All connections closed — process exiting");
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    logger.error("Forced shutdown — connections did not close in time");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ========================
// Unhandled Error Safety Nets
// ========================

/**
 * Last-resort handlers for unhandled rejections and uncaught exceptions.
 *
 * These should NEVER fire in well-written code, but they prevent
 * silent crashes in production and ensure errors are always logged.
 */
process.on("unhandledRejection", (reason: unknown) => {
  logger.error(reason, "Unhandled Promise Rejection");
  // In production, you might want to gracefully restart
});

process.on("uncaughtException", (error: Error) => {
  logger.fatal(error, "Uncaught Exception — process must exit");
  process.exit(1);
});

// Start the server
startServer();
