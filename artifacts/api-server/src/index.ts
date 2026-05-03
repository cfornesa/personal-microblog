import app from "./app";
import { logger } from "./lib/logger";
import { ensureTables } from "@workspace/db";
import { ensureMediaRoot } from "./lib/media";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

ensureTables()
  .then(() => {
    ensureMediaRoot();
    const server = app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });

    let shuttingDown = false;
    const shutdown = (signal: NodeJS.Signals) => {
      if (shuttingDown) {
        return;
      }
      shuttingDown = true;
      logger.info({ signal }, "Received shutdown signal, closing server");
      const forceExitTimer = setTimeout(() => {
        logger.warn("Forcing exit after timeout");
        process.exit(0);
      }, 5000);
      forceExitTimer.unref();

      server.close((err) => {
        if (err) {
          logger.error({ err }, "Error while closing server");
          process.exit(1);
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    logger.error({ err }, "Failed to initialize database tables");
    process.exit(1);
  });
