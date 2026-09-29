import prisma from "../../config/prisma.js";

export async function findUserByEmail(email) {
  return prisma.users.findUnique({
    where: {
      email
    }
  });
}

export async function findUserById(id) {
  return prisma.users.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true
    }
  });
}

export async function createUser({
  email,
  passwordHash,
  firstName,
  lastName
}) {
  return prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true
    }
  });
}