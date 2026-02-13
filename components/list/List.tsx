// List.tsx
import { List as ListType } from "@/utils/types/board.types";
import Card from "../card/Card";
import { useEffect, useRef, useState } from "react";
import { BoardAction } from "@/lib/hooks/useBoard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import EditableText from "../common/EditableText"; // مسیر رو چک کن

interface ListProps {
  list: ListType;
  dispatch: React.Dispatch<BoardAction>;
}

export default function List({ list, dispatch }: ListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // منطق Dnd-kit برای خودِ لیست
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: "container", children: list.cards },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddCard = () => {
    if (!cardTitle.trim()) return;
    dispatch({
      type: "ADD_CARD",
      payload: { listId: list.id, title: cardTitle },
    });
    setCardTitle("");
    setIsAdding(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="list">
      {/* هدر لیست که هم دستگیره درگ است و هم جای ادیت */}
      <div className="list__header" {...attributes} {...listeners}>
        
        {/* بخش عنوان: با stopPropagation جلوی درگ شدن موقع تایپ رو می‌گیریم */}
        <div 
          className="list-title-wrapper"
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <EditableText
            value={list.title}
            onSave={(newTitle) =>
              dispatch({
                type: "EDIT_LIST_TITLE",
                payload: { listId: list.id, title: newTitle },
              })
            }
          />
        </div>

        {/* بخش منو: اینجا هم باید جلوی درگ رو بگیریم */}
        <div 
          className="list__menu-wrapper" 
          ref={menuRef}
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <span
            className="menu-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            •••
          </span>

          {showMenu && (
            <div className="list__dropdown">
              <div
                className="menu-item"
                onClick={() => {
                  dispatch({ type: "CLEAR_LIST", payload: { listId: list.id } });
                  setShowMenu(false);
                }}
              >
                Delete all cards
              </div>
              <div
                className="menu-item delete"
                onClick={() => {
                  dispatch({ type: "DELETE_LIST", payload: { listId: list.id } });
                }}
              >
                Delete list
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="list__cards">
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              listId={list.id}
              dispatch={dispatch}
            />
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
            onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
            autoFocus
          />
          <div className="add-card__actions">
            <button onClick={handleAddCard}>Add Card</button>
            <button onClick={() => setIsAdding(false)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
}