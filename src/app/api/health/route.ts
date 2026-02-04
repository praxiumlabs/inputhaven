import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

export async function GET() {
  let dbStatus: "healthy" | "unhealthy" = "unhealthy";
  let redisStatus: "healthy" | "unhealthy" = "unhealthy";

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "healthy";
  } catch (err) {
    logger.error("Health check: database unhealthy", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }

  // Check Redis
  try {
    const pong = await redis.ping();
    if (pong === "PONG") {
      redisStatus = "healthy";
    }
  } catch (err) {
    logger.error("Health check: Redis unhealthy", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }

  let version = "unknown";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    version = require("../../../../package.json").version;
  } catch {
    // package.json not available
  }

  const allHealthy = dbStatus === "healthy" && redisStatus === "healthy";

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "degraded",
      version,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    },
    { status: allHealthy ? 200 : 503 }
  );
}
