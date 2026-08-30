import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
} satisfies NextAuthConfig;
