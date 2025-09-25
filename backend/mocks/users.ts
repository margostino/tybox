import { User } from "../generated/prisma";

export const usersMock: User[] = [
  {
    id: "1",
    email: "john@doe.com",
    name: "John Doe",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "borges@aleph.com",
    name: "Borges",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
