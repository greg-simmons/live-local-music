"use server";

import { Buffer } from "node:buffer";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";
import type { AppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabaseServer";

type ArtistRegisterState = {
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

export async function registerArtist(prevState: ArtistRegisterState | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = formatPhone(String(formData.get("contactPhone") ?? ""));
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
  const genreIds = Array.from(new Set(formData.getAll("genres").map((value) => String(value)))).filter((value) => Boolean(value));
  let profileImageUrl: string | null = null;

  if (!name || !email || !password || !contactName || !contactPhone) {
    return { error: "Please complete all required fields." } satisfies ArtistRegisterState;
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." } satisfies ArtistRegisterState;
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." } satisfies ArtistRegisterState;
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
      return { error: "Image upload failed. Please try again." } satisfies ArtistRegisterState;
    }

    const { data: publicUrlData } = supabaseServerClient.storage.from("artist-profile-images").getPublicUrl(fileName);
    profileImageUrl = publicUrlData?.publicUrl ?? null;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." } satisfies ArtistRegisterState;
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
  return session;
}

export type { ArtistRegisterState };
