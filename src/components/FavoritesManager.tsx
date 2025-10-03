import { Link } from "react-router-dom";
import { useFavorites } from "../services/CharacterService";
import type { Character } from "../types";

interface FavoritesManagerProps {
  character?: Character;
}

export default function FavoritesManager({ character }: FavoritesManagerProps) {
  const { favorites, isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  if (!character) {
    // Show favorites list
    return (
      <div>
        <h2>Your Favorite Characters ({favorites.length})</h2>
        
        {favorites.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#6b7280",
            background: "#f9fafb",
            borderRadius: "8px",
          }}>
            <p>No favorite characters yet!</p>
            <p>Browse characters and add them to your favorites.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}>
            {favorites.map((char) => (
              <div key={char.id} style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
                background: "white",
                position: "relative",
              }}>
                <button
                  onClick={() => removeFromFavorites.mutate(char.id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  title="Remove from favorites"
                >
                  ×
                </button>
                
                <Link 
                  to={`/character/${encodeURIComponent(String(char.id))}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{
                    aspectRatio: "3/4",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "8px"
                  }}>
                    {char.images?.[0] ? (
                      <img 
                        src={char.images[0]} 
                        alt={char.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#9ca3af"
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>
                    {char.name}
                  </h4>
                  
                  {char.clan && (
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
                      {char.clan}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show favorite toggle button for a specific character
  const isCharacterFavorite = isFavorite(character.id);

  return (
    <button
      onClick={() => {
        if (isCharacterFavorite) {
          removeFromFavorites.mutate(character.id);
        } else {
          addToFavorites.mutate(character);
        }
      }}
      disabled={addToFavorites.isPending || removeFromFavorites.isPending}
      style={{
        padding: "12px 16px",
        border: "2px solid",
        borderColor: isCharacterFavorite ? "#ef4444" : "#3b82f6",
        borderRadius: "8px",
        background: isCharacterFavorite ? "#ef4444" : "#3b82f6",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "500",
        opacity: addToFavorites.isPending || removeFromFavorites.isPending ? 0.7 : 1,
        transition: "all 0.2s",
      }}
    >
      {addToFavorites.isPending || removeFromFavorites.isPending 
        ? "..." 
        : isCharacterFavorite 
          ? "❤️ Remove from Favorites" 
          : "🤍 Add to Favorites"
      }
    </button>
  );
}