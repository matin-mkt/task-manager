"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";
import List from "../list/List";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function Board() {
  const { state, dispatch } = useBoard();

  const [isAdding, setIsAdding] = useState(false);
  const [listTitle, setListTitle] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // تا زمانی که کامپوننت در کلاینت کاملا لود نشده، چیزی رندر نکن
  // Auto focus when input opens
  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleAddList = () => {
    if (!listTitle.trim()) return;

    dispatch({
      type: "ADD_LIST",
      payload: { title: listTitle },
    });

    setListTitle("");
    setIsAdding(false);
  };

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, 
    },
  })
);



const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  // helper function to find the card list
  const findContainer = (id: string) => {
    if (state.lists.some(l => l.id === id)) return id; 
    const list = state.lists.find(l => l.cards.some(c => c.id === id));
    return list ? list.id : null;
  };

  const activeContainer = findContainer(activeId as string);
  const overContainer = findContainer(overId as string);

  if (!activeContainer || !overContainer) return;

  // if we are moving the lists
  if (activeId === activeContainer && overId === overContainer) {
    const oldIndex = state.lists.findIndex(l => l.id === activeId);
    const newIndex = state.lists.findIndex(l => l.id === overId);
    if (oldIndex !== newIndex) {
      dispatch({ type: "REORDER_LISTS", payload: { sourceIndex: oldIndex, destinationIndex: newIndex } });
    }
    return;
  }

  // moving the cards
  const activeIndex = state.lists.find(l => l.id === activeContainer)?.cards.findIndex(c => c.id === activeId);
  let overIndex = state.lists.find(l => l.id === overContainer)?.cards.findIndex(c => c.id === overId);


  if (overIndex === -1 || overIndex === undefined) {
    overIndex = state.lists.find(l => l.id === overContainer)?.cards.length || 0;
  }

  if (activeIndex !== undefined) {
    dispatch({
      type: "MOVE_CARD",
      payload: {
        sourceListId: activeContainer,
        destinationListId: overContainer,
        sourceIndex: activeIndex,
        destinationIndex: overIndex,
      },
    });
  }
};
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddList();
    }
  };
    if (!mounted) return null;


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <h1 className="board__title">{state.title}</h1>

        <div className="board__lists">
          <SortableContext
            items={state.lists.map((l) => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            {state.lists.map((list) => (
              <List key={list.id} list={list} dispatch={dispatch} />
            ))}
          </SortableContext>
          <div className="list add-list">
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)}>
                + Add another list
              </button>
            ) : (
              <div className="add-list__form">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter list title..."
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <div className="add-list__actions">
                  <button onClick={handleAddList}>Add List</button>
                  <button onClick={() => setIsAdding(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
