import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Brain, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIStatus {
  is_connected: bool;
  model_name: string | null;
  error: string | null;
}

export const BrainStatus = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AIStatus>({
    is_connected: false,
    model_name: null,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await invoke<AIStatus>("check_ai_status");
      setStatus(res);
    } catch (err) {
      setStatus({ is_connected: false, model_name: null, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain size={24} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('brain.status.title')}</h3>
        </div>
        <button 
          onClick={checkStatus} 
          disabled={loading}
          style={{ padding: '8px', background: 'transparent', border: '1px solid var(--glass-border)' }}
        >
          <RefreshCw size={16} className={loading ? 'pulse' : ''} />
        </button>
      </div>

      <div className={`status-badge ${status.is_connected ? 'connected' : 'disconnected'}`}>
        {status.is_connected ? (
          <>
            <CheckCircle2 size={16} />
            <div className="pulse" />
            <span>{t('brain.status.connected')}</span>
          </>
        ) : (
          <>
            <AlertCircle size={16} />
            <span>{t('brain.status.disconnected')}</span>
          </>
        )}
      </div>

      {status.is_connected && status.model_name && (
        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>{t('brain.status.model')}:</strong> {status.model_name}
        </div>
      )}

      {status.error && !status.is_connected && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--danger)', opacity: 0.8 }}>
          {status.error}
        </div>
      )}
    </div>
  );
};
