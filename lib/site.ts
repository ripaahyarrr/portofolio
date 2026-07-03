const fallbackProductionUrl = "https://ripaahyar.vercel.app";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : fallbackProductionUrl
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
  );
}

export function getBuildVersion() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev";
}
