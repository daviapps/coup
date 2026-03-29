import { useTranslation } from "react-i18next";
import "./style.css";
import type { Player } from "@coup/shared/types";

export type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({ player }: PlayerCardProps) {
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
      <p>{t(`components.player_card.active.${player.active}`)}</p>
    </div>
  );
}
