import { useState, useEffect } from "react";
import { useCharacterSearch } from "../services/CharacterService";
import { useDebounce } from "../utils/useDebounce";

interface SearchFormProps {
  onCharacterSelect?: (character: any) => void;
}

export default function CharacterSearchForm({ onCharacterSelect }: SearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data, isLoading, error } = useCharacterSearch(
    debouncedSearch, 
    debouncedSearch.length > 2
  );

  useEffect(() => {
    setIsOpen(debouncedSearch.length > 2 && (data?.items.length ?? 0) > 0);
  }, [debouncedSearch, data]);

  const handleSelect = (character: any) => {
    setSearchTerm(character.name);
    setIsOpen(false);
    onCharacterSelect?.(character);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for characters... (min 3 chars)"
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={() => setIsOpen(debouncedSearch.length > 2 && (data?.items.length ?? 0) > 0)}
        />
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            setIsOpen(false);
          }}
          style={{
            padding: "12px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {isLoading && debouncedSearch.length > 2 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          zIndex: 10,
        }}>
          Searching...
        </div>
      )}

      {error && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "16px",
          color: "#dc2626",
          zIndex: 10,
        }}>
          Error searching characters
        </div>
      )}

      {isOpen && data && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          maxHeight: "300px",
          overflowY: "auto",
          zIndex: 10,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}>
          {data.items.map((character) => (
            <div
              key={character.id}
              onClick={() => handleSelect(character)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div style={{ fontWeight: "500" }}>{character.name}</div>
              {character.clan && (
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  Clan: {character.clan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}