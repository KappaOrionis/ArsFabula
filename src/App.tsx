import { useTranslation } from "react-i18next";
import { BrainStatus } from "./components/BrainStatus";
import "./App.css";

function App() {
  const { t } = useTranslation();

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '40px'
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 800, 
          letterSpacing: '-0.05em',
          background: 'linear-gradient(to right, #8b5cf6, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          {t('app.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          {t('app.subtitle')}
        </p>
      </header>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <BrainStatus />
      </div>

      <footer style={{ position: 'absolute', bottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        OpenArs License • Local AI Powered
      </footer>
    </main>
  );
}

export default App;
