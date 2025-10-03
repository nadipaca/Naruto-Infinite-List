import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Infinite Scroll" },
    { path: "/paginated", label: "Pagination" },
    { path: "/favorites", label: "Favorites" },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ margin: "0 0 16px 0" }}>Naruto Infinite 🔥</h1>
        
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                background: location.pathname === item.path ? "#3b82f6" : "#f3f4f6",
                color: location.pathname === item.path ? "white" : "#374151",
                fontWeight: location.pathname === item.path ? "500" : "normal",
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}