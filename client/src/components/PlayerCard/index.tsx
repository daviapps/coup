import { Player } from 'lib/types';
import { useTranslation } from 'react-i18next';
import './style.css';

export type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({
  player
}: PlayerCardProps) {
  const { t } = useTranslation();

  return (
    <div className="player-card mt-2">
      {/* <span className='player-avatar'>
        {player.username
          .split(' ').map(s => s.charAt(0)).join('')
          .toUpperCase()
          .substring(0, 2)
        }
      </span>
      <div className="player-info">
        <div className="d-flex align-items-center">
          <p>{player.username}</p>
          <p>${player.money}</p>
        </div>
        <p>{player.active ? "conectado" : "desconectado"}</p>
      </div> */}
      <p>{player.username}</p>
      <p>{t(`c_player_card_active_${player.active}`)}</p>
    </div>
  );
}
