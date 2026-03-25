"use client";

import { posthog } from "./posthog";

export const track = {
  bookingCompleted: (data: {
    venueId: string;
    courtId: string;
    price: number;
    date: string;
  }) => posthog.capture("booking_completed", data),

  lobbyCreated: (data: { area: string; date: string }) =>
    posthog.capture("lobby_created", data),

  lobbyJoined: (data: { lobbyCode: string }) =>
    posthog.capture("lobby_joined", data),

  gameJoined: (data: { gameCode: string }) =>
    posthog.capture("game_joined", data),

  listingCreated: (data: { category: string; price: number }) =>
    posthog.capture("listing_created", data),

  venueViewed: (data: { venueId: string }) =>
    posthog.capture("venue_viewed", data),

  coachContacted: (data: { coachId: string }) =>
    posthog.capture("coach_contacted", data),
};
