import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Доступ к дев-серверу из локальной сети (тестировщик, телефон и т.п.)
  allowedDevOrigins: ["192.168.1.12", "192.168.1.*"],
};

export default nextConfig;
