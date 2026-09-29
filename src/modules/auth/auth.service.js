import {
  createUser,
  findUserById,
  findUserByEmail
} from "./auth.repository.js";
import {
  hashPassword, verifyPassword
} from "./password.service.js";

import {
  createAccessToken
} from "./token.service.js";

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}


export async function registerUser({
  email,
  password,
  firstName,
  lastName
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists"
    );

    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_REGISTERED";

    throw error;
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await createUser({
      email: normalizedEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    return toPublicUser(user);
  } catch (error) {
    if (error?.code === "P2002") {
      const conflictError = new Error(
        "An account with this email already exists"
      );

      conflictError.statusCode = 409;
      conflictError.code = "EMAIL_ALREADY_REGISTERED";

      throw conflictError;
    }

    throw error;
  }
}
export async function loginUser({
  email,
  password
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  const invalidCredentialsError = () => {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    return error;
  };

  if (!user) {
    throw invalidCredentialsError();
  }

  if (user.status !== "ACTIVE") {
    throw invalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(
    user.password_hash,
    password
  );

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  const accessToken = createAccessToken(user);

  return {
    user: toPublicUser(user),
    accessToken,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  };
}
export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("Authenticated user was not found");
    error.statusCode = 401;
    error.code = "AUTHENTICATED_USER_NOT_FOUND";
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("Authenticated user is not active");
    error.statusCode = 401;
    error.code = "AUTHENTICATED_USER_NOT_ACTIVE";
    throw error;
  }

  return toPublicUser(user);
}
