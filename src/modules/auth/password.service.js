import argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export async function hashPassword(password) {
     if (typeof password !== "string" || password.length === 0) {
    throw new TypeError("password must be a non-empty string");
  }
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash, password) {
    if (
    typeof passwordHash !== "string" ||
    typeof password !== "string"
  ) {
    return false;
  }
  return argon2.verify(passwordHash, password);
}