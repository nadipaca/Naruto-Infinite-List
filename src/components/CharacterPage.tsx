import { useParams, Link } from "react-router-dom";
import { useCharacter } from "../services/CharacterService";
import FavoritesManager from "./FavoritesManager";
import CharacterRating from "./CharacterRating";

export default function CharacterPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useCharacter(id);

  if (isLoading) return <p>Loading…</p>;
  if (isError || !data) return <p>Could not load character.</p>;

  const c = Array.isArray(data) ? data[0] : data;

  return (
    <div>
      <Link to="..">← Back</Link>
      <h2 style={{ marginTop: 8 }}>{c.name ?? "Unknown"}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <div>
          {c.images?.[0] ? (
            <img src={c.images[0]} alt={c.name} style={{ width: "100%", borderRadius: 12 }} />
          ) : (
            <div style={{ height: 260, background: "#f5f5f5", borderRadius: 12 }} />
          )}
          
          {/* Add the favorites button */}
          <div style={{ marginTop: 16 }}>
            <FavoritesManager character={c} />
          </div>
          <div style={{ marginTop: 16 }}>
            <CharacterRating characterId={c.id} initialRating={c.userRating ?? 0} />
          </div>
        </div>

        <div>
          {c.clan && <p><b>Clan:</b> {c.clan}</p>}
          {c.debut && <p><b>Debut:</b> {JSON.stringify(c.debut)}</p>}
          {c.jutsu?.length ? (
            <div>
              <b>Jutsu:</b>
              <ul>{c.jutsu.slice(0, 8).map((j: string, i: number) => <li key={i}>{j}</li>)}</ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}