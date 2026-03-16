import { FormEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { LogEvent } from "lib/types"
import { useTranslation } from "react-i18next";

import './style.css';

export type ChatProps = {
  enabled?: boolean;
  history: LogEvent[];
  onSend: (message: string) => void;
}

export default function Chat({
  onSend, history, enabled = true
}: ChatProps){
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>('');
  const historyContainerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if(!historyContainerRef.current) return;
    historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
  }, [history]);

  const handleSubmit = useCallback<FormEventHandler>((e) => {
    e.preventDefault();
    if(message.trim() === '') return;

    if(typeof onSend === 'function')
      onSend(message);

    setMessage('');
  }, [onSend, message]);

  return (
    <div className="chat-container">
      {Array.isArray(history) && (
        <ul className="chat-history-container" ref={historyContainerRef}>
          {history.map((event, index) => (
            <li key={index} className="chat-history-item">
              {event.origin === 'server' && (
                <p>{t(event.message, event)}</p>
              )}

              {event.origin !== 'server' && (
                <p>
                  <strong>{event.origin}</strong>
                  {event.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {!Array.isArray(history) && (
        <div className="chat-history-container">
          ...
        </div>
      )}

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          id="message"
          type="text"
          value={message}
          disabled={!enabled}
          placeholder={t('components.chat.input_placeholder') || ''}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="btn"
          style={{ display: 'none' }}
        >{t('components.chat.send_btn')}</button>
      </form>
    </div>
  )
}
