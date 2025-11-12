"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

type VenueRegisterState = {
  error?: string;
};

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function registerVenue(prevState: VenueRegisterState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").replace(/[^0-9+]/g, "");
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const zipCode = String(formData.get("zipCode") ?? "").trim();
  const latitude = parseNumber(String(formData.get("latitude") ?? ""));
  const longitude = parseNumber(String(formData.get("longitude") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name || !email || !password || !contactName || !contactPhone || !address || !city || !state || !zipCode) {
    return { error: "Please complete all required fields." } satisfies VenueRegisterState;
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." } satisfies VenueRegisterState;
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." } satisfies VenueRegisterState;
  }

  if (latitude === null || longitude === null) {
    return { error: "Enter the venue latitude and longitude." } satisfies VenueRegisterState;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." } satisfies VenueRegisterState;
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        name,
        contactName,
        contactPhone,
        contactEmail: email,
        address,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        description,
      },
    });

    await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "venue",
        isVerified: true,
        venueId: venue.id,
      },
    });
  });

  const session = (await signIn("credentials", { email, password })) as AppSession;
  redirect("/venue/dashboard");
  return session;
}

export type { VenueRegisterState };
