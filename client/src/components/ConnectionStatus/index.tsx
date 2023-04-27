import './style.css';

export type ConnectionStatusProps = {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  message?: string
};

const defaultMessages = {
  'connected': 'Connected with the server',
  'disconnected': 'Disconnected',
  'connecting': 'Connecting...',
  'error': 'Connection error'
}

export default function ConnectionStatus({
  status, message
}: ConnectionStatusProps){
  return (
    <div className="connection-status-container">
      <div className={`connection-status status-${status}`}>
        <p>{message || defaultMessages[status]}</p>
      </div>
    </div>
  )
}
