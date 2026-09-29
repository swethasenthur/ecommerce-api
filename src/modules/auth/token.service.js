import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const issuer = process.env.JWT_ISSUER || "category-api";
const audience = process.env.JWT_AUDIENCE || "category-api-client";

if (!accessSecret) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}

export function createAccessToken(user) {
  return jwt.sign(
    {
      role: user.role
    },
    accessSecret,
    {
      subject: user.id,
      expiresIn: accessExpiresIn,
      issuer,
      audience,
      algorithm: "HS256"
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret, {
    issuer,
    audience,
    algorithms: ["HS256"]
  });
}