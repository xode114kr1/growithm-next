"use server";

import { signIn } from "@/lib/auth/auth";

export async function signInWithGitHub() {
  await signIn("github");
}
