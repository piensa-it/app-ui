import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", width: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", borderBottom: "1px solid #eaeaea", backgroundColor: "white" }}>
          <div style={{ display: "flex", height: "4rem", alignItems: "center", justifyContent: "space-between", padding: "0 1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "black" }}>
                <span style={{ fontWeight: "bold", fontSize: "1.125rem" }}>App Base</span>
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {/* User Menu will go here */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #eaeaea", backgroundColor: "white", padding: "1rem 0" }}>
          <div style={{ textAlign: "center", fontSize: "0.875rem", color: "#666" }}>
            Desarrollado con ❤️
          </div>
        </footer>
      </div>
    </div>
  );
};
