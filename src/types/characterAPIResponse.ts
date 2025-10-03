export interface ApiCharacterResponse {
  id?: string | number;
  _id?: string | number;
  slug?: string;
  name?: string;
  full_name?: string;
  images?: string[];
  image?: string;
  debut?: unknown;
  jutsu?: string[];
  clan?: string;
  affiliation?: string;
}