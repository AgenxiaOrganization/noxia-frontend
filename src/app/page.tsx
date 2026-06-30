export default function Home() {
  return (
    <div style={{ padding: '2rem', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem' }}>NOXIA - Landing Page</h1>
      <p>Bienvenue sur NOXIA, l'OS intelligent pour bars et restaurants.</p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <a href="/login" style={{ padding: '0.5rem 1rem', background: '#4f46e5', borderRadius: '0.5rem', color: 'white' }}>
          Connexion
        </a>
        <a href="/register" style={{ padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: '0.5rem', color: 'white' }}>
          Essai gratuit
        </a>
      </div>
    </div>
  );
}