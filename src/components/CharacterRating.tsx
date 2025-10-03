import { useState } from "react";
import { useCharacterRating } from "../services/CharacterService";

export default function CharacterRating({ characterId, initialRating = 0 }: { characterId: string | number, initialRating?: number }) {
  const [selected, setSelected] = useState(initialRating);
  const { mutate, isPending } = useCharacterRating();

  const handleRate = (rating: number) => {
    setSelected(rating);
    mutate({ characterId: String(characterId), rating });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ marginRight: 8 }}>Rate:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          disabled={isPending}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            color: star <= selected ? "#f59e42" : "#d1d5db",
            transition: "color 0.2s",
            padding: 0,
          }}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      {isPending && <span style={{ marginLeft: 8 }}>Saving…</span>}
    </div>
  );
}