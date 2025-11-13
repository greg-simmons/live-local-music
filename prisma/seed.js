const { PrismaClient, UserRole } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const [adminPassword, artistPassword, venuePassword] = await Promise.all([
    hash('admin123', 10),
    hash('artist123', 10),
    hash('venue123', 10),
  ])

  const ensureUser = (email, passwordHash, role) =>
    prisma.user.upsert({
      where: { email },
      update: { passwordHash, role, isVerified: true },
      create: { email, passwordHash, role, isVerified: true },
    })

  // admin
  await ensureUser('admin@example.com', adminPassword, UserRole.admin)

  // artist user
  const artistUser = await ensureUser('artist@example.com', artistPassword, UserRole.artist)

  let artist =
    artistUser.artistId && (await prisma.artist.findUnique({ where: { id: artistUser.artistId } }))

  if (!artist) {
    artist =
      (await prisma.artist.findFirst({
        where: { contactEmail: 'jake@sunsetriders.com' },
      })) ||
      (await prisma.artist.create({
        data: {
          name: 'The Sunset Riders',
          contactName: 'Jake Summers',
          contactPhone: '+1 555-234-5678',
          contactEmail: 'jake@sunsetriders.com',
          bio: 'An energetic rock band with surf vibes.',
          website: 'https://sunsetriders.com',
          user: { connect: { id: artistUser.id } },
        },
      }))
  }

  await prisma.user.update({
    where: { id: artistUser.id },
    data: { artistId: artist.id },
  })

  // venue user
  const venueUser = await ensureUser('venue@example.com', venuePassword, UserRole.venue)

  let venue =
    venueUser.venueId && (await prisma.venue.findUnique({ where: { id: venueUser.venueId } }))

  if (!venue) {
    venue =
      (await prisma.venue.findFirst({
        where: { contactEmail: 'samantha@wavehousebar.com' },
      })) ||
      (await prisma.venue.create({
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
      }))
  }

  await prisma.user.update({
    where: { id: venueUser.id },
    data: { venueId: venue.id },
  })

  // genres
  const genreNames = [
    'Acoustic',
    'Alternative',
    'Americana',
    'Bluegrass',
    'Blues',
    'Rock',
    'Indie',
    'Classic Rock',
    'Country',
    'Folk',
    'Funk',
    'Hip-Hop / Rap',
    'Jazz',
    'Latin',
    'Metal',
    'Pop',
    'Punk',
    'R&B / Soul',
    'Reggae',
    'Singer-Songwriter',
    'Tribute / Cover Band',
    'Zydeco',
    'Southern Rock',
    'Dance / Party Band',
  ]

  await prisma.genre.createMany({
    data: genreNames.map((name) => ({ name })),
    skipDuplicates: true,
  })

  const [alternativeGenre, classicRockGenre] = await Promise.all(
    ['Alternative', 'Classic Rock'].map(async (name) => {
      const genre = await prisma.genre.findUnique({ where: { name } })
      if (!genre) {
        throw new Error(`Genre "${name}" not found after seeding.`)
      }
      return genre
    }),
  )

  await prisma.artistGenre.createMany({
    data: [
      { artistId: artist.id, genreId: alternativeGenre.id },
      { artistId: artist.id, genreId: classicRockGenre.id },
    ],
    skipDuplicates: true,
  })

  // events
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

  console.log('Seed done.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
