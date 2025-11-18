"use server";

import { Buffer } from "node:buffer";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
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

export async function registerArtist(prevState: FormState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const rawContactPhone = String(formData.get("contactPhone") ?? "");
  const contactPhone = formatPhone(rawContactPhone);
  const zipCode = String(formData.get("zipCode") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const tipUrl = String(formData.get("tipUrl") ?? "").trim();
  const profileImageFile = formData.get("profileImage") as File | null;
  const socialLinksInput = {
    facebook: String(formData.get("facebook") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    youtube: String(formData.get("youtube") ?? "").trim(),
    tiktok: String(formData.get("tiktok") ?? "").trim(),
  };
  const genreIds = Array.from(new Set(formData.getAll("genres").map((value) => String(value)))).filter((value) =>
    Boolean(value),
  );
  let profileImageUrl: string | null = null;

  const values: Record<string, string> = {
    name,
    email,
    contactName,
    contactPhone: rawContactPhone,
    zipCode,
    bio,
    website,
    tipUrl,
    facebook: socialLinksInput.facebook,
    instagram: socialLinksInput.instagram,
    youtube: socialLinksInput.youtube,
    tiktok: socialLinksInput.tiktok,
    genres: genreIds.join(","),
  };

  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = "Please enter your artist or band name.";
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

  if (Object.keys(errors).length) {
    return { ok: false, errors, values };
  }

  if (profileImageFile && profileImageFile.size > 0) {
    const arrayBuffer = await profileImageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const type = profileImageFile.type || "image/jpeg";
    const extension = type.split("/")[1] || "jpg";
    const safeName = slugify(name) || "artist";
    const fileName = `artists/${Date.now()}-${safeName}.${extension}`;

    const uploadResult = await supabaseServerClient.storage
      .from("artist-profile-images")
      .upload(fileName, buffer, {
        contentType: type,
        upsert: false,
      });

    if (uploadResult.error) {
      console.error("Artist image upload failed", uploadResult.error);
      return { ok: false, errors, values, formError: "Image upload failed. Please try again." };
    }

    const { data: publicUrlData } = supabaseServerClient.storage.from("artist-profile-images").getPublicUrl(fileName);
    profileImageUrl = publicUrlData?.publicUrl ?? null;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    errors.email = "An account with this email already exists.";
    return { ok: false, errors, values };
  }

  const passwordHash = await hashPassword(password);
  const socialLinksEntries = Object.entries(socialLinksInput).filter(([, value]) => Boolean(value));
  const socialLinks = socialLinksEntries.length ? Object.fromEntries(socialLinksEntries) : null;

  await prisma.$transaction(async (tx) => {
    const artist = await tx.artist.create({
      data: {
        name,
        contactName,
        contactPhone,
        contactEmail: email,
        zipCode: zipCode || null,
        bio: bio || null,
        website: website || null,
        tipUrl: tipUrl || null,
        profileImageUrl,
        socialLinks,
        genres:
          genreIds.length > 0
            ? {
                create: genreIds.map((genreId) => ({
                  genre: { connect: { id: genreId } },
                })),
              }
            : undefined,
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
  return { ok: true, errors: {}, values: {} };
}

export type { FormState };
