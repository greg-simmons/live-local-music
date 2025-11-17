"use server";

import { Buffer } from "node:buffer";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { geocodeAddress } from "@/lib/geocoding";
import { supabaseServerClient } from "@/lib/supabaseServer";

type VenueRegisterState = {
  error?: string;
};

function formatPhone(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function registerVenue(prevState: VenueRegisterState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = formatPhone(String(formData.get("contactPhone") ?? ""));
  const venuePhone = formatPhone(String(formData.get("venuePhone") ?? ""));
  const website = String(formData.get("website") ?? "").trim();
  const profileImageFile = formData.get("profileImage") as File | null;
  const allowsSmoking = formData.get("allowsSmoking") === "on";
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const zipCode = String(formData.get("zipCode") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  let profileImageUrl: string | null = null;

  if (!name || !email || !password || !contactName || !contactPhone || !address || !city || !state || !zipCode) {
    return { error: "Please complete all required fields." } satisfies VenueRegisterState;
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." } satisfies VenueRegisterState;
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." } satisfies VenueRegisterState;
  }

  if (profileImageFile && profileImageFile.size > 0) {
    const arrayBuffer = await profileImageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = profileImageFile.type || "image/jpeg";
    const extension = type.split("/")[1] || "jpg";
    const safeName = slugify(name) || "venue";
    const fileName = `venues/${Date.now()}-${safeName}.${extension}`;

    const uploadResult = await supabaseServerClient.storage
      .from("venue-profile-images")
      .upload(fileName, buffer, {
        contentType: type,
        upsert: false,
      });

    if (uploadResult.error) {
      console.error("Venue image upload failed", uploadResult.error);
      return { error: "Image upload failed. Please try again." } satisfies VenueRegisterState;
    }

    const { data: publicUrlData } = supabaseServerClient.storage.from("venue-profile-images").getPublicUrl(fileName);
    profileImageUrl = publicUrlData?.publicUrl ?? null;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." } satisfies VenueRegisterState;
  }

  const coordinates = await geocodeAddress(address, city, state, zipCode);
  if (!coordinates) {
    return { error: "We couldn't verify that address. Please confirm it and try again." } satisfies VenueRegisterState;
  }

  const passwordHash = await hashPassword(password);
  const { latitude, longitude } = coordinates;

  await prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        name,
        contactName,
        contactPhone,
        contactEmail: email,
        phone: venuePhone || null,
        website: website || null,
        profileImageUrl,
        allowsSmoking,
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
