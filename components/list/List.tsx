import { List as ListType } from "@/utils/types/board.types";
import Card from "../card/Card";
import { useEffect, useRef, useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";
import { BoardAction } from "@/lib/hooks/useBoard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core"; 
interface ListProps {
  list: ListType;
  dispatch: React.Dispatch<BoardAction>;
}

export default function List({ list, dispatch }: ListProps) {
  // const { dispatch } = useBoard();
const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
  id: list.id,
  data: {
    type: 'container',
    children: list.cards,
  },
});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleAddCard = () => {
    if (!cardTitle.trim()) return;

    dispatch({
      type: "ADD_CARD",
      payload: {
        listId: list.id,
        title: cardTitle,
      },
    });

    setCardTitle("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddCard();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="list">
      <div className="list__header" {...attributes} {...listeners}>
        <span>{list.title}</span>
        <span>•••</span>
      </div>

      <div className="list__cards">
        <SortableContext
          items={list.cards.filter((c) => c && c.id).map((c) => c.id)} // filtering undeined and null cards
          strategy={verticalListSortingStrategy}
        >
          {list.cards
            .filter((c) => c && c.id)
            .map((card) => (
              <Card listId={list.id} dispatch={dispatch} key={card.id} card={card} />
            ))}
        </SortableContext>
      </div>

      {!isAdding ? (
        <div className="list__add-card" onClick={() => setIsAdding(true)}>
          + Add another card
        </div>
      ) : (
        <div className="add-card__form">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter card title..."
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="add-card__actions">
            <button onClick={handleAddCard}>Add Card</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
