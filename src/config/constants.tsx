export const DB_NAME =
  process.env.NODE_ENV == "development" ? "eigen-insights" : "eigen-insights";

export const BASE_URL =
  process.env.NODE_ENV == "development" ? "http://localhost:3000" : "https://eigen-insight.vercel.app/";
