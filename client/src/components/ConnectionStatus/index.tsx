import './style.css';

export type ConnectionStatusProps = React.PropsWithChildren<{
  isConnected: boolean
}>;

export default function ConnectionStatus({
  isConnected, children
}: ConnectionStatusProps){
  return (
    <div className="connection-status-container">
      <div
        className={[
          "connection-status",
          isConnected ? "bg-green" : 'bg-red'
        ].join(' ')}
      >
        {isConnected && (
          <p>{children}</p>
        )}

        {!isConnected && (
          <p>Desconectado</p>
        )}
      </div>
    </div>
  )
}
