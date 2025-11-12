-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'artist', 'venue');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),
    "artist_id" TEXT,
    "venue_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "bio" TEXT,
    "zip_code" VARCHAR(10),
    "contact_name" VARCHAR(100) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "profile_image_url" VARCHAR(500),
    "website" VARCHAR(500),
    "social_links" JSONB,
    "tip_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "description" TEXT,
    "allows_smoking" BOOLEAN NOT NULL DEFAULT false,
    "profile_image_url" VARCHAR(500),
    "website" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "event_time" TIME NOT NULL,
    "startDateTime" TIMESTAMP(3),
    "cover_charge" DECIMAL(6,2),
    "age_restriction" VARCHAR(50),
    "artist_text" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "venue_id" TEXT NOT NULL,
    "artist_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_genres" (
    "artist_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "artist_genres_pkey" PRIMARY KEY ("artist_id","genre_id")
);

-- CreateTable
CREATE TABLE "favorite_artists" (
    "user_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_artists_pkey" PRIMARY KEY ("user_id","artist_id")
);

-- CreateTable
CREATE TABLE "favorite_venues" (
    "user_id" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_venues_pkey" PRIMARY KEY ("user_id","venue_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_artist_id_key" ON "users"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_venue_id_key" ON "users"("venue_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_artist_id_idx" ON "users"("artist_id");

-- CreateIndex
CREATE INDEX "users_venue_id_idx" ON "users"("venue_id");

-- CreateIndex
CREATE INDEX "artists_is_active_idx" ON "artists"("is_active");

-- CreateIndex
CREATE INDEX "artists_zip_code_idx" ON "artists"("zip_code");

-- CreateIndex
CREATE INDEX "venues_latitude_longitude_idx" ON "venues"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "venues_is_active_idx" ON "venues"("is_active");

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "events_venue_id_idx" ON "events"("venue_id");

-- CreateIndex
CREATE INDEX "events_artist_id_idx" ON "events"("artist_id");

-- CreateIndex
CREATE INDEX "events_is_active_idx" ON "events"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_genres" ADD CONSTRAINT "artist_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_artists" ADD CONSTRAINT "favorite_artists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_artists" ADD CONSTRAINT "favorite_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_venues" ADD CONSTRAINT "favorite_venues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_venues" ADD CONSTRAINT "favorite_venues_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
