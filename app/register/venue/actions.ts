"use server";

import { Buffer } from "node:buffer";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { geocodeAddress } from "@/lib/geocoding";
import { supabaseServerClient } from "@/lib/supabaseServer";

type FormState = {
  ok: boolean;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  formError?: string;
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

export async function registerVenue(prevState: FormState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const rawContactPhone = String(formData.get("contactPhone") ?? "");
  const contactPhone = formatPhone(rawContactPhone);
  const rawVenuePhone = String(formData.get("venuePhone") ?? "");
  const venuePhone = formatPhone(rawVenuePhone);
  const website = String(formData.get("website") ?? "").trim();
  const profileImageFile = formData.get("profileImage") as File | null;
  const allowsSmoking = formData.get("allowsSmoking") === "on";
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const zipCode = String(formData.get("zipCode") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let profileImageUrl: string | null = null;

  const values: Record<string, string> = {
    name,
    email,
    contactName,
    contactPhone: rawContactPhone,
    venuePhone: rawVenuePhone,
    website,
    address,
    city,
    state,
    zipCode,
    description,
    allowsSmoking: allowsSmoking ? "on" : "",
  };

  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = "Please enter your venue name.";
  }
  if (!email) {
    errors.email = "Contact email is required.";
  }
  if (!password) {
    errors.password = "Create a password.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (!contactName) {
    errors.contactName = "Booking contact name is required.";
  }
  if (!rawContactPhone) {
    errors.contactPhone = "Booking phone is required.";
  }
  if (!address) {
    errors.address = "Street address is required.";
  }
  if (!city) {
    errors.city = "City is required.";
  }
  if (!state) {
    errors.state = "State is required.";
  }
  if (!zipCode) {
    errors.zipCode = "Zip code is required.";
  }

  if (Object.keys(errors).length) {
    return { ok: false, errors, values };
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
      return { ok: false, errors, values, formError: "Image upload failed. Please try again." };
    }

    const { data: publicUrlData } = supabaseServerClient.storage.from("venue-profile-images").getPublicUrl(fileName);
    profileImageUrl = publicUrlData?.publicUrl ?? null;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    errors.email = "An account with this email already exists.";
    return { ok: false, errors, values };
  }

  const coordinates = await geocodeAddress(address, city, state, zipCode);
  if (!coordinates) {
    return {
      ok: false,
      errors: { ...errors, address: "We couldn't verify that address. Please confirm it." },
      values,
    };
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
        description: description || null,
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
  return { ok: true, errors: {}, values: {} };
}

export type { FormState };
