import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCharactersInfinite, usePrefetchCharacter } from "../services/CharacterService";
import { useDebounce } from "../utils/useDebounce";
import InfiniteSentinel from "./InfiniteSentinel";

export default function CharactersPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCharactersInfinite(debounced);
  const prefetch = usePrefetchCharacter();

  const flat = useMemo(
    () => data?.pages.flatMap(p => p.items) ?? [],
    [data]
  );

  const onLoadMore = useCallback(() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search characters (e.g., Naruto, Sasuke)…"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p>Could not load characters.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
        {flat.map((c) => (
          <Link
            key={c.id}
            to={`/character/${encodeURIComponent(String(c.id))}`}
            onMouseEnter={() => prefetch(c.id)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
              <div style={{ aspectRatio: "3/4", background: "#f5f5f5", borderRadius: 8, overflow: "hidden" }}>
                {c.images?.[0] ? (
                  <img src={c.images[0]} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#777" }}>No image</div>
                )}
              </div>
              <h3 style={{ margin: "8px 0 0 0", fontSize: 16 }}>{c.name}</h3>
              {c.clan && <p style={{ margin: 0, color: "#666" }}>Clan: {c.clan}</p>}
            </article>
          </Link>
        ))}
      </div>

      <div style={{ margin: "16px 0" }}>
        {isFetchingNextPage && <p>Loading more…</p>}
        {!isLoading && !isError && <InfiniteSentinel disabled={!hasNextPage} onVisible={onLoadMore} />}
        {!hasNextPage && flat.length > 0 && <p style={{ color: "#666" }}>You’ve reached the end.</p>}
      </div>
    </div>
  );
}
