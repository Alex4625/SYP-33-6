import type { AccountStatus, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role: Role;
      status: AccountStatus;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role: Role;
    status: AccountStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username?: string;
    role: Role;
    status: AccountStatus;
  }
}
