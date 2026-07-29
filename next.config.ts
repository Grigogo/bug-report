import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Доступ к дев-серверу из локальной сети (тестировщик, телефон и т.п.)
  allowedDevOrigins: ["192.168.1.12", "192.168.1.*"],
  env: {
    // Метка версии в подвале: когда собран билд (запекается при сборке)
    NEXT_PUBLIC_BUILD_AT: new Date().toISOString(),
  },
};

export default nextConfig;
