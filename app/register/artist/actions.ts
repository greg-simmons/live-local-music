"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

type ArtistRegisterState = {
  error?: string;
};

function formatPhone(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

export async function registerArtist(prevState: ArtistRegisterState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = formatPhone(String(formData.get("contactPhone") ?? ""));
  const zipCode = String(formData.get("zipCode") ?? "").trim();

  if (!name || !email || !password || !contactName || !contactPhone) {
    return { error: "Please complete all required fields." } satisfies ArtistRegisterState;
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." } satisfies ArtistRegisterState;
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." } satisfies ArtistRegisterState;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." } satisfies ArtistRegisterState;
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const artist = await tx.artist.create({
      data: {
        name,
        contactName,
        contactPhone,
        contactEmail: email,
        zipCode: zipCode || null,
      },
    });

    await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "artist",
        isVerified: true,
        artistId: artist.id,
      },
    });
  });

  const session = (await signIn("credentials", { email, password })) as AppSession;
  redirect("/artist/dashboard");
  return session;
}

export type { ArtistRegisterState };
