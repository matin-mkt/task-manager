import { List as ListType } from "@/utils/types/board.types";
import Card from "../card/Card";

interface ListProps {
  list: ListType;
}

export default function List({ list }: ListProps) {
  return (
    <div className="list">
      <div className="list__header">
        <span>{list.title}</span>
        <span>•••</span>
      </div>

      <div className="list__cards">
        {list.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      <div className="list__add-card">
        + Add another card
      </div>
    </div>
  );
}
