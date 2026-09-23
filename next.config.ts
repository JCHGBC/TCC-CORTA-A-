import type { NextConfig } from "next";

/** Endereço da API em PHP (mude com a variável de ambiente API_URL, se precisar). */
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Tudo que o front-end chamar em /api/... é repassado para o servidor PHP
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
