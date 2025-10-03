import type { Character, Paged, ApiCharacterResponse, ApiResponse } from "../types";
import { morphism, createSchema } from "morphism";

// Define the morphism schema for character mapping
const characterSchema = createSchema<Character>({
  id: (source: ApiCharacterResponse) => 
    source.id ?? source._id ?? source.slug ?? source.name ?? "",
  name: (source: ApiCharacterResponse) => 
    source.name ?? source.full_name ?? "Unknown",
  images: (source: ApiCharacterResponse) => 
    source.images ?? (source.image ? [source.image] : undefined),
  debut: "debut",
  jutsu: "jutsu",
  clan: (source: ApiCharacterResponse) => 
    source.clan ?? source.affiliation
});

/**
 * Normalize the API response into { items, count, total }.
 */
export function CharacterMapper(raw: ApiResponse): Paged<Character> {
  const candidates = raw?.items ?? raw?.results ?? raw?.characters ?? raw?.data ?? raw;
  const rawItems = Array.isArray(candidates) ? candidates : [];
  
  const items = morphism(characterSchema, rawItems);
  
  return {
    items,
    count: items.length,
    total: raw?.total ?? raw?.count
  };
}