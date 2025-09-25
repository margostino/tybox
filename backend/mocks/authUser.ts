import { User } from "../generated/prisma";

export const authUser: User = {
  id: "2",
  email: "borges@aleph.com",
  name: "Borges",
  username: "borges",
  passwordHash: "$2b$12$D3uFSC9.ZbKEFy7jLpzzCudMHN1MjoUzilK.4GHFFpUquURqIIlTW", // just a mock"
  createdAt: new Date(),
  updatedAt: new Date(),
};
