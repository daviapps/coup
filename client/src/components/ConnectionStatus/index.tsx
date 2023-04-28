import { useTranslation } from 'react-i18next';
import './style.css';

export type ConnectionStatusProps = {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  message?: string
};

export default function ConnectionStatus({
  status, message
}: ConnectionStatusProps){
  const { t } = useTranslation();

  return (
    <div className="connection-status-container">
      <div className={`connection-status status-${status}`}>
        <p>{message || t(`c_conn_status_default_msg_${status}`)}</p>
      </div>
    </div>
  )
}
