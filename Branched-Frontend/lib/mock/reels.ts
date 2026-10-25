/**
 * lib/mock/reels.ts: the reels Michael sends (Phase 2 THE SCRIPTS, STATE 3; INSTAGRAM REELS).
 * Stills are our own illustrations (assets/images/reel-*.svg -> public/mock/).
 */
import type { PersonId } from "./people";

export type ReelId = "dormlife" | "goldenhour" | "recleague";

export type Reel = {
  id: ReelId;
  poster: PersonId;
  handle: string;
  image: string;
  /** one-line caption, word for word; null = COPY NEEDED (nothing shown) */
  caption: string | null;
  likes: string;
  comments: string;
  shares: string;
};

export const reels: Record<ReelId, Reel> = {
  dormlife: {
    id: "dormlife",
    poster: "dormlife",
    handle: "dormlife.tx",
    image: "/mock/reel-dormlife.svg",
    caption: "when your roommate says 'one episode' at 1am",
    likes: "48.2K",
    comments: "312",
    shares: "9,104",
  },
  goldenhour: {
    id: "goldenhour",
    poster: "goldenhour",
    handle: "goldenhour.pups",
    image: "/mock/reel-goldenhour-pups.svg",
    caption: null, // COPY NEEDED: Michael's Sep 30 reel caption
    likes: "126K",
    comments: "1,027",
    shares: "22.4K",
  },
  recleague: {
    id: "recleague",
    poster: "recleague",
    handle: "rec.league.legends",
    image: "/mock/reel-rec-league.svg",
    caption: null, // COPY NEEDED: Michael's Sun reel caption
    likes: "73.9K",
    comments: "604",
    shares: "5,388",
  },
};

export const reelOrder: ReelId[] = ["recleague", "goldenhour", "dormlife"];
