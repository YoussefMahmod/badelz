import { PrismaClient, DayOfWeek, SportType, PlayerTier, ListingCategory, ListingCondition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Mala3eb database...");

  // Create demo venue owner
  const demoPassword = process.env.DEMO_PASSWORD || "password123";
  const hashedPassword = await bcrypt.hash(demoPassword, 12);
  const owner = await prisma.user.upsert({
    where: { email: "owner@badelz.app" },
    update: {},
    create: {
      name: "Ahmed Hassan",
      email: "owner@badelz.app",
      password: hashedPassword,
      phone: "01012345678",
      role: "VENUE_OWNER",
      isOnboarded: true,
      locale: "ar",
    },
  });
  console.log(`Created owner: ${owner.email}`);

  // Create second owner
  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@badelz.app" },
    update: {},
    create: {
      name: "Mohamed Ali",
      email: "owner2@badelz.app",
      password: hashedPassword,
      phone: "01112345678",
      role: "VENUE_OWNER",
      isOnboarded: true,
      locale: "ar",
    },
  });

  // ─── Demo Player account ───
  const playerUser = await prisma.user.upsert({
    where: { email: "player@badelz.app" },
    update: {},
    create: {
      name: "يوسف محمد",
      email: "player@badelz.app",
      password: hashedPassword,
      phone: "01023456789",
      role: "PLAYER",
      isOnboarded: true,
      locale: "ar",
    },
  });
  console.log(`Created player: ${playerUser.email}`);

  // ─── Demo Coach account ───
  const coachUser = await prisma.user.upsert({
    where: { email: "coach@badelz.app" },
    update: {},
    create: {
      name: "Captain Tarek",
      email: "coach@badelz.app",
      password: hashedPassword,
      phone: "01055555001",
      role: "COACH",
      isOnboarded: true,
      locale: "ar",
    },
  });
  console.log(`Created coach: ${coachUser.email}`);

  // ─── Venue 1: New Cairo Padel Club ───
  const venue1 = await prisma.venue.create({
    data: {
      ownerId: owner.id,
      name: "New Cairo Padel Club",
      nameAr: "نيو كايرو بادل كلوب",
      description:
        "Premium padel courts in the heart of New Cairo. Professional lighting, air-conditioned viewing area, and equipment rental available.",
      descriptionAr:
        "كورتات بادل مميزة في قلب التجمع الخامس. إضاءة احترافية ومنطقة مشاهدة مكيفة وتأجير معدات.",
      phone: "01012345678",
      whatsapp: "01012345678",
      address: "Street 90, New Cairo, 5th Settlement",
      addressAr: "شارع التسعين، التجمع الخامس، القاهرة الجديدة",
      city: "New Cairo",
      cityAr: "التجمع الخامس",
      latitude: 30.0131,
      longitude: 31.4915,
      coverPhoto:
        "https://images.unsplash.com/photo-1673266893352-6de89e258064?w=800&h=400&fit=crop",
      photos: [
        "https://images.unsplash.com/photo-1673266893352-6de89e258064?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1709587824751-dd30420f5cf3?w=800&h=600&fit=crop",
      ],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.7,
      ratingCount: 42,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue1.name}`);

  // ─── Venue 2: Sheikh Zayed Padel Arena ───
  const venue2 = await prisma.venue.create({
    data: {
      ownerId: owner2.id,
      name: "Sheikh Zayed Padel Arena",
      nameAr: "شيخ زايد بادل أرينا",
      description:
        "4 premium padel courts with night play capability. Restaurant and lounge on site.",
      descriptionAr:
        "4 كورتات بادل مميزة مع إضاءة ليلية. مطعم ولاونج في الموقع.",
      phone: "01112345678",
      whatsapp: "01112345678",
      address: "Hyper One Mall Area, Sheikh Zayed City",
      addressAr: "منطقة هايبر وان مول، مدينة الشيخ زايد",
      city: "Sheikh Zayed",
      cityAr: "الشيخ زايد",
      latitude: 30.0422,
      longitude: 31.0125,
      coverPhoto:
        "https://images.unsplash.com/photo-1709587825415-814c2d7cfce7?w=800&h=400&fit=crop",
      photos: [
        "https://images.unsplash.com/photo-1709587825415-814c2d7cfce7?w=800&h=600&fit=crop",
      ],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.5,
      ratingCount: 28,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue2.name}`);

  // ─── Venue 3: Maadi Padel Center ───
  const venue3 = await prisma.venue.create({
    data: {
      ownerId: owner.id,
      name: "Maadi Padel Center",
      nameAr: "مركز المعادي للبادل",
      description:
        "Cozy padel center in Maadi with 2 indoor courts. Great for beginners and pros alike.",
      descriptionAr:
        "مركز بادل في المعادي بـ 2 كورت مغطي. مناسب للمبتدئين والمحترفين.",
      phone: "01212345678",
      whatsapp: "01212345678",
      address: "Road 9, Maadi, Cairo",
      addressAr: "شارع 9، المعادي، القاهرة",
      city: "Maadi",
      cityAr: "المعادي",
      latitude: 29.9602,
      longitude: 31.2569,
      coverPhoto:
        "https://images.unsplash.com/photo-1646649853703-7645147474ba?w=800&h=400&fit=crop",
      photos: [],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.3,
      ratingCount: 15,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue3.name}`);

  // ─── Venue 4: Heliopolis Padel Hub ───
  const venue4 = await prisma.venue.create({
    data: {
      ownerId: owner2.id,
      name: "Heliopolis Padel Hub",
      nameAr: "هليوبوليس بادل هب",
      description:
        "Modern padel facility in the heart of Heliopolis. 3 courts with professional lighting and cafe.",
      descriptionAr:
        "مركز بادل حديث في قلب مصر الجديدة. 3 كورتات بإضاءة احترافية وكافيه.",
      phone: "01312345678",
      whatsapp: "01312345678",
      address: "Merghany Street, Heliopolis",
      addressAr: "شارع المرغني، مصر الجديدة",
      city: "Heliopolis",
      cityAr: "مصر الجديدة",
      latitude: 30.0866,
      longitude: 31.3225,
      coverPhoto:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop",
      photos: [
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop",
      ],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.6,
      ratingCount: 35,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue4.name}`);

  // ─── Venue 5: Nasr City Padel Zone ───
  const venue5 = await prisma.venue.create({
    data: {
      ownerId: owner.id,
      name: "Nasr City Padel Zone",
      nameAr: "بادل زون مدينة نصر",
      description:
        "Affordable padel courts in Nasr City. Great for beginners. Equipment rental available.",
      descriptionAr:
        "كورتات بادل بأسعار مناسبة في مدينة نصر. ممتاز للمبتدئين. تأجير معدات متاح.",
      phone: "01412345678",
      whatsapp: "01412345678",
      address: "Abbas El-Akkad Street, Nasr City",
      addressAr: "شارع عباس العقاد، مدينة نصر",
      city: "Nasr City",
      cityAr: "مدينة نصر",
      latitude: 30.0561,
      longitude: 31.3465,
      coverPhoto:
        "https://images.unsplash.com/photo-1709587824751-dd30420f5cf3?w=800&h=400&fit=crop",
      photos: [],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.1,
      ratingCount: 19,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue5.name}`);

  // ─── Venue 6: October Padel Park ───
  const venue6 = await prisma.venue.create({
    data: {
      ownerId: owner2.id,
      name: "October Padel Park",
      nameAr: "أكتوبر بادل بارك",
      description:
        "Open-air padel park in 6th of October City. 3 courts with evening floodlights and parking.",
      descriptionAr:
        "بارك بادل مفتوح في 6 أكتوبر. 3 كورتات بكشافات ليلية وباركينج.",
      phone: "01512345678",
      whatsapp: "01512345678",
      address: "Mehwar Road, 6th of October City",
      addressAr: "طريق المحور، مدينة 6 أكتوبر",
      city: "6th of October",
      cityAr: "6 أكتوبر",
      latitude: 29.9723,
      longitude: 30.9465,
      coverPhoto:
        "https://images.unsplash.com/photo-1646649853703-7645147474ba?w=800&h=400&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1646649853703-7645147474ba?w=800&h=600&fit=crop",
      ],
      sportTypes: [SportType.PADEL],
      isFoundingVenue: true,
      rating: 4.4,
      ratingCount: 22,
      isActive: true,
    },
  });
  console.log(`Created venue: ${venue6.name}`);

  // ─── Courts for Venue 1 ───
  const courts1 = await Promise.all([
    prisma.court.create({
      data: {
        venueId: venue1.id,
        name: "Court 1",
        nameAr: "كورت 1",
        sportType: SportType.PADEL,
        pricePerHour: 600,
        sortOrder: 1,
      },
    }),
    prisma.court.create({
      data: {
        venueId: venue1.id,
        name: "Court 2",
        nameAr: "كورت 2",
        sportType: SportType.PADEL,
        pricePerHour: 600,
        sortOrder: 2,
      },
    }),
    prisma.court.create({
      data: {
        venueId: venue1.id,
        name: "Court 3 (Premium)",
        nameAr: "كورت 3 (بريميوم)",
        sportType: SportType.PADEL,
        pricePerHour: 800,
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`Created ${courts1.length} courts for ${venue1.name}`);

  // ─── Courts for Venue 2 ───
  const courts2 = await Promise.all([
    prisma.court.create({
      data: {
        venueId: venue2.id,
        name: "Court A",
        nameAr: "كورت A",
        sportType: SportType.PADEL,
        pricePerHour: 500,
        sortOrder: 1,
      },
    }),
    prisma.court.create({
      data: {
        venueId: venue2.id,
        name: "Court B",
        nameAr: "كورت B",
        sportType: SportType.PADEL,
        pricePerHour: 500,
        sortOrder: 2,
      },
    }),
  ]);

  // ─── Courts for Venue 3 ───
  const courts3 = await Promise.all([
    prisma.court.create({
      data: {
        venueId: venue3.id,
        name: "Indoor Court 1",
        nameAr: "كورت داخلي 1",
        sportType: SportType.PADEL,
        pricePerHour: 450,
        sortOrder: 1,
      },
    }),
    prisma.court.create({
      data: {
        venueId: venue3.id,
        name: "Indoor Court 2",
        nameAr: "كورت داخلي 2",
        sportType: SportType.PADEL,
        pricePerHour: 450,
        sortOrder: 2,
      },
    }),
  ]);

  // ─── Courts for Venue 4 ───
  const courts4 = await Promise.all([
    prisma.court.create({
      data: { venueId: venue4.id, name: "Court 1", nameAr: "كورت 1", sportType: SportType.PADEL, pricePerHour: 550, sortOrder: 1 },
    }),
    prisma.court.create({
      data: { venueId: venue4.id, name: "Court 2", nameAr: "كورت 2", sportType: SportType.PADEL, pricePerHour: 550, sortOrder: 2 },
    }),
    prisma.court.create({
      data: { venueId: venue4.id, name: "Court 3 (VIP)", nameAr: "كورت 3 (VIP)", sportType: SportType.PADEL, pricePerHour: 750, sortOrder: 3 },
    }),
  ]);

  // ─── Courts for Venue 5 ───
  const courts5 = await Promise.all([
    prisma.court.create({
      data: { venueId: venue5.id, name: "Court 1", nameAr: "كورت 1", sportType: SportType.PADEL, pricePerHour: 400, sortOrder: 1 },
    }),
    prisma.court.create({
      data: { venueId: venue5.id, name: "Court 2", nameAr: "كورت 2", sportType: SportType.PADEL, pricePerHour: 400, sortOrder: 2 },
    }),
  ]);

  // ─── Courts for Venue 6 ───
  const courts6 = await Promise.all([
    prisma.court.create({
      data: { venueId: venue6.id, name: "Court A", nameAr: "كورت A", sportType: SportType.PADEL, pricePerHour: 500, sortOrder: 1 },
    }),
    prisma.court.create({
      data: { venueId: venue6.id, name: "Court B", nameAr: "كورت B", sportType: SportType.PADEL, pricePerHour: 500, sortOrder: 2 },
    }),
    prisma.court.create({
      data: { venueId: venue6.id, name: "Court C (Night)", nameAr: "كورت C (ليلي)", sportType: SportType.PADEL, pricePerHour: 600, sortOrder: 3 },
    }),
  ]);
  console.log(`Created courts for venues 4-6`);

  // ─── Time Slots (all courts, all days) ───
  const allCourts = [...courts1, ...courts2, ...courts3, ...courts4, ...courts5, ...courts6];
  const days = Object.values(DayOfWeek);
  const timeSlots = [
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "12:00", end: "13:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
    { start: "19:00", end: "20:00" },
    { start: "20:00", end: "21:00" },
    { start: "21:00", end: "22:00" },
    { start: "22:00", end: "23:00" },
  ];

  let slotCount = 0;
  for (const court of allCourts) {
    for (const day of days) {
      for (const slot of timeSlots) {
        await prisma.timeSlot.create({
          data: {
            courtId: court.id,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            isActive: true,
          },
        });
        slotCount++;
      }
    }
  }
  console.log(`Created ${slotCount} time slots`);

  // ─── Sample Bookings ───
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        courtId: courts1[0].id,
        venueId: venue1.id,
        playerName: "يوسف محمد",
        playerPhone: "01023456789",
        date: today,
        startTime: "18:00",
        endTime: "19:00",
        totalPrice: 600,
        status: "CONFIRMED",
        confirmationCode: "ABC123",
      },
    }),
    prisma.booking.create({
      data: {
        courtId: courts1[1].id,
        venueId: venue1.id,
        playerName: "خالد أحمد",
        playerPhone: "01123456789",
        date: today,
        startTime: "19:00",
        endTime: "20:00",
        totalPrice: 600,
        status: "CONFIRMED",
        confirmationCode: "DEF456",
      },
    }),
    prisma.booking.create({
      data: {
        courtId: courts1[2].id,
        venueId: venue1.id,
        playerName: "عمر حسن",
        playerPhone: "01223456789",
        date: tomorrow,
        startTime: "20:00",
        endTime: "21:00",
        totalPrice: 800,
        status: "PENDING",
        confirmationCode: "GHJ789",
      },
    }),
    prisma.booking.create({
      data: {
        courtId: courts2[0].id,
        venueId: venue2.id,
        playerName: "أحمد سعيد",
        playerPhone: "01523456789",
        date: tomorrow,
        startTime: "17:00",
        endTime: "18:00",
        totalPrice: 500,
        status: "CONFIRMED",
        confirmationCode: "KLM012",
      },
    }),
  ]);
  console.log(`Created ${bookings.length} sample bookings`);

  // ─── Player Profiles (6 tiers) ───
  const players = await Promise.all([
    prisma.playerProfile.create({
      data: {
        phone: "01023456789",
        name: "يوسف محمد",
        nameAr: "يوسف محمد",
        area: "New Cairo",
        areaAr: "القاهرة الجديدة",
        gamesPlayed: 1,
        gamesWon: 0,
        rating: 3.5,
        tier: PlayerTier.BRONZE,
        isEarlyAdopter: true,
        userId: playerUser.id,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01123456789",
        name: "خالد أحمد",
        nameAr: "خالد أحمد",
        area: "New Cairo",
        areaAr: "القاهرة الجديدة",
        gamesPlayed: 5,
        gamesWon: 3,
        rating: 4.0,
        tier: PlayerTier.GOLD,
        isEarlyAdopter: true,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01223456789",
        name: "عمر حسن",
        nameAr: "عمر حسن",
        area: "Sheikh Zayed",
        areaAr: "الشيخ زايد",
        gamesPlayed: 15,
        gamesWon: 10,
        rating: 4.5,
        tier: PlayerTier.EMERALD,
        isEarlyAdopter: true,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01523456789",
        name: "أحمد سعيد",
        nameAr: "أحمد سعيد",
        area: "Maadi",
        areaAr: "المعادي",
        gamesPlayed: 30,
        gamesWon: 22,
        rating: 4.7,
        tier: PlayerTier.DIAMOND,
        isEarlyAdopter: true,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01098765432",
        name: "محمد إبراهيم",
        nameAr: "محمد إبراهيم",
        area: "6th of October",
        areaAr: "6 أكتوبر",
        gamesPlayed: 55,
        gamesWon: 40,
        rating: 4.9,
        tier: PlayerTier.MASTER,
        isEarlyAdopter: true,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01012345678",
        name: "علي حسام",
        nameAr: "علي حسام",
        area: "Sheikh Zayed",
        areaAr: "الشيخ زايد",
        gamesPlayed: 120,
        gamesWon: 95,
        rating: 5.0,
        tier: PlayerTier.GRANDMASTER,
        isEarlyAdopter: true,
      },
    }),
    prisma.playerProfile.create({
      data: {
        phone: "01187654321",
        name: "كريم مصطفى",
        nameAr: "كريم مصطفى",
        area: "Nasr City",
        areaAr: "مدينة نصر",
        gamesPlayed: 2,
        gamesWon: 1,
        rating: 3.8,
        tier: PlayerTier.BRONZE,
        isEarlyAdopter: true,
      },
    }),
  ]);
  console.log(`Created ${players.length} player profiles`);

  // ─── Lobbies ───
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const lobby1 = await prisma.lobby.create({
    data: {
      lobbyCode: "PLAY01",
      hostName: "يوسف محمد",
      hostPhone: "01023456789",
      area: "New Cairo",
      areaAr: "القاهرة الجديدة",
      date: tomorrow,
      startTime: "20:00",
      priceRange: "150-200",
      note: "ماتش ودي بعد الشغل",
      status: "OPEN",
      players: {
        create: [
          { position: 0, playerName: "يوسف محمد", playerPhone: "01023456789" },
          { position: 1, playerName: "خالد أحمد", playerPhone: "01123456789" },
        ],
      },
    },
  });

  const lobby2 = await prisma.lobby.create({
    data: {
      lobbyCode: "PLAY02",
      hostName: "عمر حسن",
      hostPhone: "01223456789",
      area: "Sheikh Zayed",
      areaAr: "الشيخ زايد",
      date: dayAfterTomorrow,
      startTime: "18:00",
      priceRange: "200-300",
      status: "OPEN",
      players: {
        create: [
          { position: 0, playerName: "عمر حسن", playerPhone: "01223456789" },
        ],
      },
    },
  });

  const lobby3 = await prisma.lobby.create({
    data: {
      lobbyCode: "FULL01",
      hostName: "أحمد سعيد",
      hostPhone: "01523456789",
      area: "Maadi",
      areaAr: "المعادي",
      date: tomorrow,
      startTime: "21:00",
      priceRange: "100-150",
      status: "FULL",
      players: {
        create: [
          { position: 0, playerName: "أحمد سعيد", playerPhone: "01523456789" },
          { position: 1, playerName: "محمد إبراهيم", playerPhone: "01098765432" },
          { position: 2, playerName: "علي كمال", playerPhone: "01034567890" },
          { position: 3, playerName: "سامي فؤاد", playerPhone: "01134567890" },
        ],
      },
    },
  });

  const lobby4 = await prisma.lobby.create({
    data: {
      lobbyCode: "PLAY03",
      hostName: "محمد إبراهيم",
      hostPhone: "01098765432",
      area: "6th of October",
      areaAr: "6 أكتوبر",
      date: dayAfterTomorrow,
      startTime: "19:00",
      priceRange: "150-200",
      note: "مستوى متوسط",
      status: "OPEN",
      players: {
        create: [
          { position: 0, playerName: "محمد إبراهيم", playerPhone: "01098765432" },
          { position: 1, playerName: "كريم طارق", playerPhone: "01234567891" },
          { position: 2, playerName: "حسن مصطفى", playerPhone: "01534567891" },
        ],
      },
    },
  });
  const lobby5 = await prisma.lobby.create({
    data: {
      lobbyCode: "PLAY04",
      hostName: "علي حسام",
      hostPhone: "01012345678",
      area: "Heliopolis",
      areaAr: "مصر الجديدة",
      date: tomorrow,
      startTime: "17:00",
      priceRange: "200-250",
      note: "مستوى متقدم",
      status: "OPEN",
      players: {
        create: [
          { position: 0, playerName: "علي حسام", playerPhone: "01012345678" },
          { position: 1, playerName: "ياسر عمر", playerPhone: "01612345679" },
        ],
      },
    },
  });

  const lobby6 = await prisma.lobby.create({
    data: {
      lobbyCode: "PLAY05",
      hostName: "كريم مصطفى",
      hostPhone: "01187654321",
      area: "Nasr City",
      areaAr: "مدينة نصر",
      date: dayAfterTomorrow,
      startTime: "16:00",
      priceRange: "100-150",
      note: "مبتدئين welcome",
      status: "OPEN",
      players: {
        create: [
          { position: 0, playerName: "كريم مصطفى", playerPhone: "01187654321" },
        ],
      },
    },
  });
  console.log(`Created 6 lobbies (3 open, 1 full, 1 almost full, 1 beginner)`);

  // ─── Coaches ───
  const coaches = await Promise.all([
    prisma.coach.create({
      data: {
        name: "Captain Tarek",
        nameAr: "كابتن طارق",
        phone: "01055555001",
        whatsapp: "01055555001",
        photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face",
        bio: "Former professional padel player with 5+ years of coaching experience. Specialized in beginners and intermediate players.",
        bioAr: "لاعب بادل محترف سابق مع خبرة أكتر من 5 سنين في التدريب. متخصص في تدريب المبتدئين والمتوسطين.",
        areas: ["New Cairo", "Heliopolis"],
        areasAr: ["القاهرة الجديدة", "مصر الجديدة"],
        pricePerHour: 300,
        experience: "5 years, FIP Level 1",
        heartCount: 52,
        isPioneerCoach: true,
        isActive: true,
        userId: coachUser.id,
      },
    }),
    prisma.coach.create({
      data: {
        name: "Captain Sara",
        nameAr: "كابتن سارة",
        phone: "01055555002",
        whatsapp: "01055555002",
        photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop&crop=face",
        bio: "Women's padel specialist. Group and private lessons available.",
        bioAr: "متخصصة في تدريب السيدات بادل. حصص جماعية وخاصة.",
        areas: ["Sheikh Zayed", "6th of October"],
        areasAr: ["الشيخ زايد", "6 أكتوبر"],
        pricePerHour: 250,
        experience: "3 years",
        heartCount: 28,
        isPioneerCoach: true,
        isActive: true,
      },
    }),
    prisma.coach.create({
      data: {
        name: "Captain Hossam",
        nameAr: "كابتن حسام",
        phone: "01055555003",
        whatsapp: "01055555003",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        bio: "National team player. High-performance coaching for competitive players.",
        bioAr: "لاعب منتخب مصر. تدريب عالي الأداء للاعبين المحترفين.",
        areas: ["New Cairo", "Maadi", "Nasr City"],
        areasAr: ["القاهرة الجديدة", "المعادي", "مدينة نصر"],
        pricePerHour: 500,
        experience: "8 years, National Team",
        heartCount: 87,
        isPioneerCoach: true,
        isActive: true,
      },
    }),
    prisma.coach.create({
      data: {
        name: "Captain Yasser",
        nameAr: "كابتن ياسر",
        phone: "01055555004",
        whatsapp: "01055555004",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
        bio: "Kids and youth padel training. Making padel fun for the next generation!",
        bioAr: "تدريب بادل للأطفال والشباب. نخلي البادل ممتع للجيل الجاي!",
        areas: ["Sheikh Zayed", "New Cairo"],
        areasAr: ["الشيخ زايد", "القاهرة الجديدة"],
        pricePerHour: 200,
        experience: "4 years, Youth Specialist",
        heartCount: 12,
        isPioneerCoach: true,
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${coaches.length} coaches`);

  // ─── Marketplace Listings ───
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        sellerName: "كريم طارق",
        sellerPhone: "01234567891",
        title: "Babolat Technical Viper 2024",
        titleAr: "بابولات تكنيكال فايبر 2024",
        description: "Used for 3 months only. Excellent condition. Original grip.",
        descriptionAr: "مستعمل 3 شهور بس. حالة ممتازة. الجريب أصلي.",
        price: 4500,
        category: ListingCategory.RACKETS,
        condition: ListingCondition.LIKE_NEW,
        photos: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop"],
        area: "New Cairo",
        areaAr: "القاهرة الجديدة",
        views: 23,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "أحمد سعيد",
        sellerPhone: "01523456789",
        title: "Metalbone Vertex 2024",
        titleAr: "ميتالبون فيرتكس 2024",
        description: "Top of the line padel racket. Used for 6 months. No cracks.",
        descriptionAr: "أفضل مضرب بادل. مستعمل 6 شهور. بدون شروخ.",
        price: 6000,
        category: ListingCategory.RACKETS,
        condition: ListingCondition.USED,
        photos: ["https://images.unsplash.com/photo-1617083934551-43e146bc39ef?w=400&h=400&fit=crop"],
        area: "Maadi",
        areaAr: "المعادي",
        views: 42,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "سارة محمود",
        sellerPhone: "01055555002",
        title: "Asics Gel-Lima FF 2 Padel Shoes",
        titleAr: "جزمة أسيكس جيل ليما بادل",
        description: "Size 42. Worn twice. Too small for me.",
        descriptionAr: "مقاس 42. اتلبست مرتين. صغيرة عليا.",
        price: 2800,
        category: ListingCategory.SHOES,
        condition: ListingCondition.LIKE_NEW,
        area: "Sheikh Zayed",
        areaAr: "الشيخ زايد",
        views: 15,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "عمر حسن",
        sellerPhone: "01223456789",
        title: "Adidas Padel Bag Pro Tour 3.2",
        titleAr: "شنطة أديداس بادل برو تور",
        description: "Fits 2 rackets + shoes compartment. Clean, no tears.",
        descriptionAr: "تسع 2 مضرب + جيب للجزمة. نظيفة بدون قطع.",
        price: 1200,
        category: ListingCategory.BAGS,
        condition: ListingCondition.USED,
        area: "New Cairo",
        areaAr: "القاهرة الجديدة",
        views: 8,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "محمد إبراهيم",
        sellerPhone: "01098765432",
        title: "Head Padel Pro S Balls (3 cans)",
        titleAr: "كور هيد بادل برو (3 علب)",
        description: "Unopened. Original packaging. Bulk buy leftover.",
        descriptionAr: "مش مفتوحين. تغليف أصلي. فاضلين من شراء بالجملة.",
        price: 450,
        category: ListingCategory.BALLS,
        condition: ListingCondition.NEW,
        area: "6th of October",
        areaAr: "6 أكتوبر",
        views: 31,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "ياسين خالد",
        sellerPhone: "01534567891",
        title: "Bullpadel Overgrip Pack (12 pcs)",
        titleAr: "باك أوفرجريب بولبادل 12 قطعة",
        description: "White overgrips. Opened but only used 3.",
        descriptionAr: "أوفرجريب أبيض. مفتوح بس استخدمت 3 بس.",
        price: 200,
        category: ListingCategory.ACCESSORIES,
        condition: ListingCondition.USED,
        area: "Nasr City",
        areaAr: "مدينة نصر",
        views: 5,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "حسن علي",
        sellerPhone: "01612345678",
        title: "Wilson Bela Pro V2",
        titleAr: "ويلسون بيلا برو V2",
        description: "Pro-level racket. Diamond shape. 4 months old.",
        descriptionAr: "مضرب مستوى محترف. شكل ماسي. عمره 4 شهور.",
        price: 5200,
        category: ListingCategory.RACKETS,
        condition: ListingCondition.LIKE_NEW,
        photos: ["https://images.unsplash.com/photo-1617083934551-43e146bc39ef?w=400&h=400&fit=crop&q=80"],
        area: "Sheikh Zayed",
        areaAr: "الشيخ زايد",
        views: 37,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "طارق محمود",
        sellerPhone: "01712345678",
        title: "Nike Court Zoom Pro Padel",
        titleAr: "نايكي كورت زوم برو بادل",
        description: "Size 44. Like new, played 5 times only.",
        descriptionAr: "مقاس 44. شبه جديد، لعبت بيه 5 مرات بس.",
        price: 3200,
        category: ListingCategory.SHOES,
        condition: ListingCondition.LIKE_NEW,
        area: "New Cairo",
        areaAr: "القاهرة الجديدة",
        views: 19,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "مروان سامي",
        sellerPhone: "01812345678",
        title: "Head Pro Padel Overgrip (30 pack)",
        titleAr: "هيد برو أوفرجريب بادل (30 قطعة)",
        description: "Brand new sealed box. White color.",
        descriptionAr: "علبة جديدة متبرشمة. لون أبيض.",
        price: 350,
        category: ListingCategory.ACCESSORIES,
        condition: ListingCondition.NEW,
        area: "Maadi",
        areaAr: "المعادي",
        views: 11,
      },
    }),
    prisma.listing.create({
      data: {
        sellerName: "نور أحمد",
        sellerPhone: "01912345678",
        title: "Nox Padel Bag + 2 Rackets Bundle",
        titleAr: "شنطة نوكس بادل + 2 مضرب باندل",
        description: "Selling together. Bag fits 3 rackets. Both rackets intermediate level.",
        descriptionAr: "بيعهم مع بعض. الشنطة تسع 3 مضارب. المضربين مستوى متوسط.",
        price: 8000,
        category: ListingCategory.RACKETS,
        condition: ListingCondition.USED,
        photos: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop&q=80"],
        area: "6th of October",
        areaAr: "6 أكتوبر",
        views: 56,
      },
    }),
  ]);
  console.log(`Created ${listings.length} marketplace listings`);

  console.log("\nSeed complete!");
  console.log("─────────────────────────────────");
  console.log("Demo logins (all use password123):");
  console.log("  Venue Owner: owner@badelz.app");
  console.log("  Player:      player@badelz.app");
  console.log("  Coach:       coach@badelz.app");
  console.log("─────────────────────────────────");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
