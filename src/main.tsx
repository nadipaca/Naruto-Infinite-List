import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import CharactersPage from "./components/CharactersPage";
import CharacterPage from "./components/CharacterPage";
import PaginatedCharacters from "./components/PaginatedCharacters";
import FavoritesManager from "./components/FavoritesManager";

// React Query Client configuration:
// - staleTime: How long (in ms) fetched data is considered "fresh" and won't be refetched automatically.
//   Example: staleTime: 60_000 means data is fresh for 1 minute after fetching.
// - refetchOnWindowFocus: If false, queries will NOT refetch when the browser window regains focus.
//   Example: If you switch tabs and come back, data won't refetch automatically.
// - retry: Number of times to retry a failed query before showing an error.
//   Example: retry: 1 means React Query will try once more after the first failure (total 2 attempts).
// - refetchOnMount: If true, queries will refetch when the component mounts, even if data is cached.
//   Example: Navigating back to a page will trigger a refetch.
// - mutations.retry: Number of times to retry a failed mutation.
//   Example: retry: 1 means a failed mutation will be retried once.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 60_000, 
      refetchOnWindowFocus: false, 
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CharactersPage /> },
      { path: "paginated", element: <PaginatedCharacters /> },
      { path: "favorites", element: <FavoritesManager /> },
      { path: "character/:id", element: <CharacterPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);