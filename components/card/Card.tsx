// Card.tsx اصلاح شده
"use client";

import { useState } from "react";
import { Card as CardType } from "@/utils/types/board.types";
import { BoardAction } from "@/lib/hooks/useBoard";
import CommentModal from "../common/CommentModal"; // مسیر رو چک کن
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CardProps {
  card: CardType;
  listId: string; // این رو اضافه کن
  dispatch: React.Dispatch<BoardAction>; // این رو اضافه کن
}

export default function Card({ card, listId, dispatch }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // منطق dnd-kit که قبلاً داشتیم
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className="card"
        {...attributes} 
        {...listeners}
      >
        <div className="card__title">{card.title}</div>

        <div className="card__footer">
          
          <span 
            className="card__comments" 
            onClick={(e) => {
              e.stopPropagation(); 
              setIsModalOpen(true);
            }}
          >
            Comments ({card.comments.length})
          </span>
        </div>
      </div>

      {isModalOpen && (
        <CommentModal 
          card={card}
          listId={listId}
          dispatch={dispatch}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}