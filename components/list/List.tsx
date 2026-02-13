import { List as ListType } from "@/utils/types/board.types";
import Card from "../card/Card";
import { useEffect, useRef, useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";

interface ListProps {
  list: ListType;
  dispatch: React.Dispatch<any>;
}

export default function List({ list, dispatch }: ListProps) {
  // const { dispatch } = useBoard();

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
