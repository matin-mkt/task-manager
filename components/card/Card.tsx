import { Card as CardType } from "@/utils/types/board.types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {

  const { attributes, listeners, setNodeRef, transform, transition } = 
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="card">
      <div className="card__title">{card.title}</div>

      <div className="card__footer">
        <span className="card__comments">
          Comments ({card.comments.length})
        </span>
      </div>
    </div>
  );
}
