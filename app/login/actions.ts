"use server";

import { AuthError, auth, signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginState = {
  error?: string;
};

function redirectForRole(session: AppSession) {
  switch (session.user.role) {
    case "admin":
      redirect("/admin");
    case "artist":
      redirect("/artist/dashboard");
    case "venue":
    default:
      redirect("/venue/dashboard");
  }
}

export async function authenticate(prevState: LoginState | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both your email and password." } satisfies LoginState;
  }

  try {
    const session = (await signIn("credentials", { email, password })) as AppSession;
    redirectForRole(session);
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." } satisfies LoginState;
      }
      return { error: "Unable to sign you in. Please try again." } satisfies LoginState;
    }
    console.error("Unhandled sign-in error", error);
    return { error: "Something went wrong. Please try again." } satisfies LoginState;
  }
}

export async function checkSessionAndRedirect() {
  const session = await auth();
  if (!session) {
    return;
  }
  redirectForRole(session);
}

export type { LoginState };
