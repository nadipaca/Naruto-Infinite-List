import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { CharacterMapper } from "../mappers";
import type { Character } from "../types";

const PAGE_SIZE = 20;

// Helper function to seed individual character data from list data
// It takes the list of characters returned from a search or paginated API call (mapped.items) and 
// stores each character's data in React Query's cache as if you had fetched them individually.
const seedCharacterDataFromList = (queryClient: any, characters: Character[]) => {
  characters.forEach(character => {
    queryClient.setQueryData(["character", String(character.id)], character);
  });
};

// Infinite query for characters with support for search and infinite scroll.
//
// - Uses React Query's useInfiniteQuery to fetch pages of character data.
// - queryKey: ["characters", { search }] ensures cache is unique per search term.
// - queryFn: Fetches a page of characters from multiple possible endpoints.
// - initialPageParam: 1 (starts pagination from page 1).
// - getNextPageParam: Determines if there are more pages to fetch based on lastPage.count and PAGE_SIZE.
// - Each page's characters are mapped and seeded into the cache for individual character queries.
// - Handles API errors gracefully and logs failures for debugging.
// - retry: 1 — will retry once if the request fails.
// - staleTime: 5 minutes — data is considered fresh for 5 minutes.
// - Useful for implementing infinite scroll UI patterns (e.g., "Load More" or auto-loading on scroll).
//
// Example usage:
//   const { data, fetchNextPage, hasNextPage, isFetching } = useCharactersInfinite(searchTerm);
export function useCharactersInfinite(search: string) {
  const queryClient = useQueryClient();
  
  return useInfiniteQuery({
    queryKey: ["characters", { search }],
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`Fetching characters: page=${pageParam}, search="${search}"`);
      
      try {
        // Try multiple endpoints
        const endpoints = [
          `/characters?page=${pageParam}&limit=${PAGE_SIZE}${search ? `&name=${search}` : ''}`,
          `/character?page=${pageParam}&limit=${PAGE_SIZE}${search ? `&name=${search}` : ''}`,
          `/api/characters?page=${pageParam}&limit=${PAGE_SIZE}${search ? `&name=${search}` : ''}`
        ];

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const { data } = await api.get(endpoint);
            console.log("API Response:", data);
            
            if (data) {
              const mapped = CharacterMapper(data);
              console.log("Mapped data:", mapped);
              
              // Seed individual character queries with this data
              seedCharacterDataFromList(queryClient, mapped.items);
              
              return mapped;
            }
          } catch (endpointError) {
            console.log(`Endpoint ${endpoint} failed:`, endpointError);
            continue;
          }
        }
        
        throw new Error("All endpoints failed");
        
      } catch (error) {
        console.error("API Error, using mock data:", error);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if ((lastPage.count ?? 0) < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

// Standard paginated query for characters.
//
// - Uses React Query's useQuery to fetch a single page of character data.
// - queryKey: ["characters", "paginated", { page, search, limit }] ensures cache is unique per page and search term.
// - queryFn: Fetches a page of characters from multiple possible endpoints.
// - Each page's characters are mapped and seeded into the cache for individual character queries.
// - Handles API errors gracefully and logs failures for debugging.
// - placeholderData: Uses previous data while loading new data for smoother UI.
// - retry: 1 — will retry once if the request fails.
// - staleTime: 5 minutes — data is considered fresh for 5 minutes.
// - Useful for classic pagination UI patterns (e.g., numbered pages, "Next"/"Previous" buttons).
//
// Example usage:
//   const { data, isLoading, error } = useCharactersPaginated(page, searchTerm, limit);
export function useCharactersPaginated(page: number, search: string, limit = PAGE_SIZE) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["characters", "paginated", { page, search, limit }],
    queryFn: async () => {
      console.log(`Fetching paginated characters: page=${page}, search="${search}"`);
      
      try {
        const endpoints = [
          `/characters?page=${page}&limit=${limit}${search ? `&name=${search}` : ''}`,
          `/character?page=${page}&limit=${limit}${search ? `&name=${search}` : ''}`,
        ];

        for (const endpoint of endpoints) {
          try {
            const { data } = await api.get(endpoint);
            if (data) {
              const mapped = CharacterMapper(data);
              
              // Seed individual character queries with this data
              seedCharacterDataFromList(queryClient, mapped.items);
              
              return mapped;
            }
          } catch (endpointError) {
            continue;
          }
        }
        
        throw new Error("All endpoints failed");
        
      } catch (error) {
        console.error("Paginated API Error, using mock data:", error);
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Fetch a single character by ID using React Query.
//
// - Only runs if an ID is provided (enabled: !!id).
// - Uses multiple possible endpoints to fetch the character details.
// - queryKey: ["character", id] ensures each character is cached separately.
// - queryFn: Tries each endpoint in order until one succeeds, or throws an error if all fail.
// - staleTime: 60_000 ms (1 minute) — data is considered fresh for 1 minute.
// - retry: 1 — will retry once if the request fails.
//
// Example usage:
//   const { data, isLoading, error } = useCharacter("123");
export function useCharacter(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["character", id],
    queryFn: async () => {
      console.log(`Fetching character: id=${id}`);
      
      try {
        const endpoints = [
          `/characters/${id}`,
          `/character/${id}`,
          `/api/characters/${id}`
        ];

        for (const endpoint of endpoints) {
          try {
            const { data } = await api.get(endpoint);
            if (data) {
              return data;
            }
          } catch (endpointError) {
            continue;
          }
        }
        
        throw new Error("Character not found");
        
      } catch (error) {
        console.error("Character API Error:", error);
      }
    },
    staleTime: 60_000,
    retry: 1,
  });
}

// Prefetch a single character's data and store it in the React Query cache.
//
// - usePrefetchCharacter returns a function that takes a character ID.
// - It checks if the character's data is already in the cache using queryClient.getQueryData.
// - If not cached, it prefetches the character data from the API and stores it in the cache using queryClient.prefetchQuery.
// - This is useful for anticipating user actions (e.g., hovering a link or preloading details before navigation), so data is instantly available when needed.
// - Only fetches if the data is not already cached, preventing unnecessary network requests.
//
// Example usage:
//   const prefetchCharacter = usePrefetchCharacter();
//   prefetchCharacter("123"); // Prefetches character with ID "123" if not already cached
export function usePrefetchCharacter() {
  const queryClient = useQueryClient();
  
  return (id: string | number) => {
    // Check if we already have this character data
    const existingData = queryClient.getQueryData(["character", String(id)]);
    
    // Only prefetch if we don't have the data
    if (!existingData) {
      queryClient.prefetchQuery({
        queryKey: ["character", String(id)],
        queryFn: async () => {
          try {
            const { data } = await api.get(`/characters/${id}`);
            return data;
          } catch (error) {
            throw new Error(error.message);
          }
        },
        staleTime: 60_000,
      });
    }
  };
}

// Character search with debouncing
// In addition to fetch data from endpoint using useQuer, here we are using seedCharacterDataFromList -> which takes list of characters returned from a search or paginatedAPI (mapped.items)
//  and stores each character data in React Query's cache as it was fetched individually.
//  queryClient is an instance of React Query's cache manager.
// seedCharacterDataFromList loops through each character and calls 
//  queryClient.setQueryData(["character", String(character.id)], character);
export function useCharacterSearch(searchTerm: string, enabled = true) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["characters", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { items: [], count: 0, total: 0 };
      
      console.log(`Searching characters: term="${searchTerm}"`);
      
      try {
        const { data } = await api.get("/characters", {
          params: { name: searchTerm, limit: 10 }
        });
        const mapped = CharacterMapper(data);
        
        // Seed individual character queries with search results
        seedCharacterDataFromList(queryClient, mapped.items);
        
        return mapped;
      } catch (error) {
        console.error("Search API Error, using mock data:", error);
      }
    },
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

// Manage favorite characters using React Query and localStorage.
//
// - useFavorites provides methods to get, add, and remove favorite characters.
// - Favorites are stored in localStorage under the key 'naruto-favorites'.
// - useQuery is used to read the favorites list and keep it in sync with the UI.
// - addToFavorites and removeFromFavorites use useMutation to update localStorage and invalidate the favorites query, ensuring UI updates.
// - Prevents duplicate favorites when adding.
// - isFavorite helper checks if a character is already in the favorites list.
// - Returns the favorites list, loading state, and mutation methods.
//
// Example usage:
//   const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
//   addToFavorites.mutate(character);
//   removeFromFavorites.mutate(characterId);
//   isFavorite(characterId); // returns true or false
export function useFavorites() {
  const queryClient = useQueryClient();

  const getFavorites = (): Character[] => {
    const stored = localStorage.getItem('naruto-favorites');
    return stored ? JSON.parse(stored) : [];
  };

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    staleTime: Infinity,
  });

  const addToFavorites = useMutation({
    mutationFn: async (character: Character) => {
      const favorites = getFavorites();
      // Prevent duplicates
      if (favorites.some(fav => fav.id === character.id)) {
        return favorites;
      }
      const updated = [...favorites, character];
      localStorage.setItem('naruto-favorites', JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      // Invalidating the query ensures the UI always shows the current favorites list after any change.
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (characterId: string | number) => {
      const favorites = getFavorites();
      const updated = favorites.filter(char => char.id !== characterId);
      localStorage.setItem('naruto-favorites', JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite: (id: string | number) => 
      (favoritesQuery.data || []).some(char => char.id === id),
  };
}

// Manage user ratings for characters with optimistic UI updates.
//
// - useCharacterRating provides a mutation for submitting a rating for a character.
// - Uses optimistic updates: updates the character's rating in the cache immediately for a fast UI response.
// - If the mutation fails, rolls back to the previous cached value.
// - On success or failure, ensures the cache stays in sync by invalidating the character's query.
// - Simulates a network delay (for demo purposes) before returning the new rating.
// - Useful for rating systems where you want instant feedback and robust error handling.
//
// Example usage:
//   const rateCharacter = useCharacterRating();
//   rateCharacter.mutate({ characterId: "123", rating: 5 });
export function useCharacterRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, rating }: { characterId: string; rating: number }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { characterId, rating };
    },
    onMutate: async ({ characterId, rating }) => {
      await queryClient.cancelQueries({ queryKey: ["character", characterId] });
      const previousCharacter = queryClient.getQueryData(["character", characterId]);
      queryClient.setQueryData(["character", characterId], (old: any) => ({
        ...old,
        userRating: rating,
      }));
      return { previousCharacter };
    },
    onError: (err, variables, context) => {
      if (context?.previousCharacter) {
        queryClient.setQueryData(["character", variables.characterId], context.previousCharacter);
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["character", data.characterId] });
      }
    },
  });
}