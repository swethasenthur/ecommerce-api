function requiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const authConfig = Object.freeze({
  accessSecret: requiredEnvironmentVariable("JWT_ACCESS_SECRET"),
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  issuer: process.env.JWT_ISSUER || "category-api",
  audience: process.env.JWT_AUDIENCE || "category-api-client"
});