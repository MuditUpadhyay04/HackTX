// The People tab's data: everyone grouped by who they are to him, with their photos (GET /api/people/groups).
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { api, type LanePhoto, type PeopleGroup, type PeopleGroups, type PersonPhotos } from "./api";

/** Plain labels (Gurneal owns the wording). */
export const GROUP_LABEL: Record<PeopleGroup, string> = {
  mom: "Mom",
  dad: "Dad",
  brother: "Brother",
  sister: "Sister",
  best_friend: "Best friend",
  partner: "Partner",
  other: "Other",
};

/** True when the group label would only repeat the name ("Mom" for Mom). */
export const sameAsName = (entry: PersonPhotos) => GROUP_LABEL[entry.group].toLowerCase() === entry.person.name.trim().toLowerCase();

export type PeopleFilter = "all" | "family" | PeopleGroup;

/** The seeded SVG placeholders say "add the real photo"; the People tab only shows real image files. */
export const showable = (photos: LanePhoto[]) => photos.filter((p) => !/\.svg($|\?)/i.test(p.url ?? ""));

export function usePeopleGroups() {
  const [data, setData] = useState<PeopleGroups | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await api.peopleGroups();
      if (alive.current) {
        setData(next);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      alive.current = true;
      refresh();
      return () => void (alive.current = false);
    }, [refresh]),
  );

  return { data, error, refresh };
}
