// Centralized JSON-LD structured data builders for SEO

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "بادلز - Badelz",
    url: "https://badelz.app",
    logo: "https://badelz.app/icons/icon-192.png",
    description: "احجز كورت بادل في مصر في ثواني. بدون مكالمات، بدون انتظار.",
  };
}

export function buildWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "بادلز",
    url: "https://badelz.app",
    applicationCategory: "SportsApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EGP",
    },
  };
}

export function buildVenueJsonLd(venue: {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  city: string;
  cityAr?: string | null;
  address: string;
  addressAr?: string | null;
  phone: string;
  coverPhoto?: string | null;
  rating: number;
  ratingCount: number;
  latitude?: number | null;
  longitude?: number | null;
  startingPrice?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: venue.nameAr || venue.name,
    description: venue.descriptionAr || venue.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: venue.cityAr || venue.city,
      streetAddress: venue.addressAr || venue.address,
      addressCountry: "EG",
    },
    ...(venue.latitude && venue.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: venue.latitude,
        longitude: venue.longitude,
      },
    }),
    telephone: venue.phone,
    ...(venue.coverPhoto && { image: venue.coverPhoto }),
    url: `https://badelz.app/venues/${venue.id}`,
    ...(venue.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: venue.rating,
        reviewCount: venue.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(venue.startingPrice && {
      priceRange: `${venue.startingPrice} EGP`,
    }),
    currenciesAccepted: "EGP",
    sport: "Padel",
  };
}

export function buildListingJsonLd(listing: {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  category: string;
  condition: string;
  photos: string[];
  status: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.titleAr || listing.title,
    ...(listing.descriptionAr || listing.description
      ? { description: listing.descriptionAr || listing.description }
      : {}),
    ...(listing.photos.length > 0 && { image: listing.photos[0] }),
    url: `https://badelz.app/market/${listing.id}`,
    category: "Padel Equipment",
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "EGP",
      availability:
        listing.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      itemCondition:
        listing.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };
}

export function buildCoachJsonLd(coach: {
  id: string;
  name: string;
  nameAr?: string | null;
  bio?: string | null;
  bioAr?: string | null;
  photo?: string | null;
  areas: string[];
  areasAr: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.nameAr || coach.name,
    ...(coach.bioAr || coach.bio
      ? { description: coach.bioAr || coach.bio }
      : {}),
    ...(coach.photo && { image: coach.photo }),
    jobTitle: "مدرب بادل",
    url: `https://badelz.app/coaches/${coach.id}`,
    ...(coach.areasAr?.length || coach.areas?.length
      ? { areaServed: coach.areasAr.length > 0 ? coach.areasAr : coach.areas }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://badelz.app${item.url}`,
    })),
  };
}
