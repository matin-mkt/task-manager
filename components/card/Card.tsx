import { Card as CardType } from "@/utils/types/board.types";

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  return (
    <div className="card">
      <div className="card__title">{card.title}</div>

      <div className="card__footer">
        <span className="card__comments">
          Comments ({card.comments.length})
        </span>
      </div>
    </div>
  );
}
