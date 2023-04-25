import './style.css';

export type RoomSlotProps = React.PropsWithChildren<{
  title: string;
}>;

export default function RoomSlot({
  title, children
}: RoomSlotProps) {
  return (
    <div className="room-slot">
      <p className="room-slot-title">{title}</p>
      {children}
    </div>
  );
}
