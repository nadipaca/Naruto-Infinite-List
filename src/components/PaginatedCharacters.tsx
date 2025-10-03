import { useState } from "react";
import { Link } from "react-router-dom";
import { useCharactersPaginated, usePrefetchCharacter } from "../services/CharacterService";
import { useDebounce } from "../utils/useDebounce";

export default function PaginatedCharacters() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(20);
  
  const debouncedSearch = useDebounce(search, 400);
  const prefetchCharacter = usePrefetchCharacter();
  
  const { data, isLoading, error, isPreviousData } = useCharactersPaginated(
    currentPage,
    debouncedSearch,
    pageSize
  );

  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div>
      {/* Search and Controls */}
      <div style={{ 
        display: "flex", 
        gap: 16, 
        alignItems: "center", 
        marginBottom: 24,
        flexWrap: "wrap"
      }}>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          placeholder="Search characters..."
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          }}
        />
        
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          }}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div>Loading characters...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          padding: "16px",
          borderRadius: "8px",
          color: "#dc2626",
          marginBottom: "16px"
        }}>
          Error loading characters. Please try again.
        </div>
      )}

      {/* Results Info */}
      {data && (
        <div style={{ 
          marginBottom: 16, 
          color: "#6b7280",
          opacity: isPreviousData ? 0.5 : 1,
          transition: "opacity 0.2s"
        }}>
          Showing {data.items.length} of {data.total} characters 
          (Page {currentPage} of {totalPages})
          {isPreviousData && " (Previous data)"}
        </div>
      )}

      {/* Characters Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
        gap: 16,
        opacity: isPreviousData ? 0.5 : 1,
        transition: "opacity 0.2s"
      }}>
        {data?.items.map((character) => (
          <Link
            key={character.id}
            to={`/character/${encodeURIComponent(String(character.id))}`}
            onMouseEnter={() => prefetchCharacter(character.id)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              background: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{
                aspectRatio: "3/4",
                background: "#f9fafb",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "12px"
              }}>
                {character.images?.[0] ? (
                  <img 
                    src={character.images[0]} 
                    alt={character.name}
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
              
              <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                {character.name}
              </h3>
              
              {character.clan && (
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                  {character.clan}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          marginTop: 32,
          flexWrap: "wrap"
        }}>
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: currentPage === 1 ? "#f9fafb" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          {/* First page */}
          {generatePageNumbers()[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                1
              </button>
              {generatePageNumbers()[0] > 2 && <span>...</span>}
            </>
          )}

          {/* Page numbers */}
          {generatePageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: currentPage === page ? "#3b82f6" : "white",
                color: currentPage === page ? "white" : "black",
                cursor: "pointer",
                fontWeight: currentPage === page ? "bold" : "normal",
              }}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {generatePageNumbers()[generatePageNumbers().length - 1] < totalPages && (
            <>
              {generatePageNumbers()[generatePageNumbers().length - 1] < totalPages - 1 && <span>...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: currentPage === totalPages ? "#f9fafb" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}