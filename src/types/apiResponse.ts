import type { ApiCharacterResponse } from "./characterAPIResponse";

export interface ApiResponse {
  items?: ApiCharacterResponse[];
  results?: ApiCharacterResponse[];
  characters?: ApiCharacterResponse[];
  data?: ApiCharacterResponse[] | ApiCharacterResponse;
  total?: number;
  count?: number;
}