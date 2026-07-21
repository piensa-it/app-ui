import { Layout } from "@/components/Layout";
import { useAuth } from "@/features/auth/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <main style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Dashboard</h1>
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "1.5rem", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #eaeaea" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Bienvenido, {user?.email || 'Usuario'}
          </h2>
          <p style={{ color: "#666" }}>
            Este es un template base sin dependencias visuales. Construye tu UI usando la librería de componentes externa.
          </p>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
