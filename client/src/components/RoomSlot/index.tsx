import './style.css';

export type RoomSlotProps = React.PropsWithChildren<{
  title?: string;
  className?: string;
}>;

export default function RoomSlot({
  title, className, children
}: RoomSlotProps) {
  return (
    <div className={['room-slot', className].join(' ')}>
      {title && <p className="room-slot-title">{title}</p>}
      {children}
    </div>
  );
}
