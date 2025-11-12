const { PrismaClient, UserRole } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const artistPassword = await bcrypt.hash('artist123', 10)
  const venuePassword = await bcrypt.hash('venue123', 10)

  // --- Admin user ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.admin,
      isVerified: true,
    },
  })

  // --- Artist user + artist record ---
  const artistUser = await prisma.user.create({
    data: {
      email: 'artist@example.com',
      passwordHash: artistPassword,
      role: UserRole.artist,
      isVerified: true,
    },
  })

  const artist = await prisma.artist.create({
    data: {
      name: 'The Sunset Riders',
      bio: 'An energetic rock band with surf vibes and coastal charm.',
      contactName: 'Jake Summers',
      contactPhone: '+1 555-234-5678',
      contactEmail: 'jake@sunsetriders.com',
      website: 'https://sunsetriders.com',
      user: { connect: { id: artistUser.id } },
    },
  })

  // link user → artist
  await prisma.user.update({
    where: { id: artistUser.id },
    data: { artistId: artist.id },
  })

  // --- Venue user + venue record ---
  const venueUser = await prisma.user.create({
    data: {
      email: 'venue@example.com',
      passwordHash: venuePassword,
      role: UserRole.venue,
      isVerified: true,
    },
  })

  const venue = await prisma.venue.create({
    data: {
      name: 'The Wavehouse Bar',
      address: '123 Ocean Ave',
      city: 'Santa Cruz',
      state: 'CA',
      zipCode: '95060',
      latitude: 36.9741,
      longitude: -122.0308,
      contactName: 'Samantha Lee',
      contactPhone: '+1 555-876-5432',
      contactEmail: 'samantha@wavehousebar.com',
      description: 'Beachfront venue hosting local music every weekend.',
      website: 'https://wavehousebar.com',
      user: { connect: { id: venueUser.id } },
    },
  })

  // link user → venue
  await prisma.user.update({
    where: { id: venueUser.id },
    data: { venueId: venue.id },
  })

  // --- Genres ---
  const rock = await prisma.genre.create({
    data: { name: 'Rock', description: 'Electric guitars and strong rhythms' },
  })

  const indie = await prisma.genre.create({
    data: { name: 'Indie', description: 'Independent alternative music' },
  })

  await prisma.artistGenre.createMany({
    data: [
      { artistId: artist.id, genreId: rock.id },
      { artistId: artist.id, genreId: indie.id },
    ],
  })

  // --- Events ---
  await prisma.event.create({
    data: {
      title: 'Sunset Jam at the Wavehouse',
      description: 'A perfect evening of live rock and ocean breeze.',
      eventDate: new Date('2025-11-20'),
      eventTime: new Date('2025-11-20T19:30:00Z'),
      startDateTime: new Date('2025-11-20T19:30:00Z'),
      coverCharge: 10.0,
      venue: { connect: { id: venue.id } },
      artist: { connect: { id: artist.id } },
      createdBy: { connect: { id: artistUser.id } },
    },
  })

  await prisma.event.create({
    data: {
      title: 'Open Mic Night',
      description: 'Local artists take the stage.',
      eventDate: new Date('2025-11-25'),
      eventTime: new Date('2025-11-25T20:00:00Z'),
      startDateTime: new Date('2025-11-25T20:00:00Z'),
      venue: { connect: { id: venue.id } },
      artistText: 'Various Local Artists',
      createdBy: { connect: { id: venueUser.id } },
    },
  })

  console.log('✅ Seed done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
