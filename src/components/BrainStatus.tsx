import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Brain, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIStatus {
  is_connected: boolean;
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
    <div className="brain-status-container">
      <div className="brain-status-header">
        <div className="brain-status-title">
          <Brain size={20} className="text-blue-400" />
          <span className="font-header text-lg">{t('brain.status.title')}</span>
        </div>
        <button 
          onClick={checkStatus} 
          disabled={loading}
          className="refresh-btn"
        >
          <RefreshCw size={14} className={loading ? 'pulse' : ''} />
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


      {status.error && !status.is_connected && (
        <div className="mt-3 text-xs text-danger opacity-80 italic">
          {status.error}
        </div>
      )}
    </div>
  );
};
