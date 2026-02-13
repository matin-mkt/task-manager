"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";
import List from "../list/List";
import Card from "../card/Card";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Card as CardType } from "@/utils/types/board.types";
import { rectIntersection, pointerWithin, getFirstCollision } from "@dnd-kit/core";


export default function Board() {
  const { state, dispatch } = useBoard();
  const [mounted, setMounted] = useState(false);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: string) => {
    if (state.lists.some((l) => l.id === id)) return id;
    return state.lists.find((l) => l.cards.some((c) => c.id === id))?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    const card = state.lists.flatMap((l) => l.cards).find((c) => c.id === active.id);
    if (card) setActiveCard(card);
  };

const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id.toString();
  const overId = over.id.toString();

  // --- ۱. منطق جابه‌جایی لیست‌ها (جدید) ---
  // اگر آیتمی که درگ شده خودش یک لیست باشد
  if (state.lists.some((l) => l.id === activeId)) {
    const oldIndex = state.lists.findIndex((l) => l.id === activeId);
    const newIndex = state.lists.findIndex((l) => l.id === overId);

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      dispatch({
        type: "REORDER_LISTS",
        payload: { sourceIndex: oldIndex, destinationIndex: newIndex },
      });
    }
    return; // اگر لیست بود، کار همینجا تمومه
  }

  // --- ۲. منطق جابه‌جایی کارت‌ها (همان قبلی) ---
  const activeContainer = findContainer(activeId);
  const overContainer = findContainer(overId);

  if (!activeContainer || !overContainer || activeContainer === overContainer) return;

  const activeIndex = state.lists.find((l) => l.id === activeContainer)?.cards.findIndex((c) => c.id === activeId);
  const overIndex = state.lists.find((l) => l.id === overContainer)?.cards.findIndex((c) => c.id === overId);
  
  const destIndex = overIndex !== -1 ? overIndex : state.lists.find(l => l.id === overContainer)?.cards.length || 0;

  dispatch({
    type: "MOVE_CARD",
    payload: {
      sourceListId: activeContainer,
      destinationListId: overContainer,
      sourceIndex: activeIndex ?? 0,
      destinationIndex: destIndex ?? 0,
    },
  });
};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // moving lists
    if (state.lists.some(l => l.id === activeId)) {
      const oldIndex = state.lists.findIndex((l) => l.id === activeId);
      const newIndex = state.lists.findIndex((l) => l.id === overId);
      if (oldIndex !== newIndex) {
        dispatch({ type: "REORDER_LISTS", payload: { sourceIndex: oldIndex, destinationIndex: newIndex } });
      }
      return;
    }

    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer) {
      const activeIndex = state.lists.find(l => l.id === activeContainer)?.cards.findIndex(c => c.id === activeId);
      const overIndex = state.lists.find(l => l.id === overContainer)?.cards.findIndex(c => c.id === overId);

      if (activeIndex !== overIndex) {
        dispatch({
          type: "MOVE_CARD",
          payload: {
            sourceListId: activeContainer,
            destinationListId: overContainer,
            sourceIndex: activeIndex ?? 0,
            destinationIndex: overIndex ?? 0,
          },
        });
      }
    }
  };

  const handleAddList = () => {
    if (!listTitle.trim()) return;
    dispatch({ type: "ADD_LIST", payload: { title: listTitle } });
    setListTitle("");
    setIsAdding(false);
  };

  const customCollisionStrategy = (args: any) => {
  // اول چک کن ببین مستقیم روی کدوم آیتم هستیم
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;

  // اگر نبود، برخورد مستطیل‌ها رو چک کن
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) return rectCollisions;

  // در نهایت نزدیک‌ترین گوشه
  return closestCorners(args);
};

  if (!mounted) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <h1 className="board__title">{state.title}</h1>
        <div className="board__lists">
          <SortableContext items={state.lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            {state.lists.map((list) => (
              <List key={list.id} list={list} dispatch={dispatch} />
            ))}
          </SortableContext>

          
          <div className="list add-list">
            {!isAdding ? (
              <button className="add-list-btn" onClick={() => setIsAdding(true)}>
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
                  onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                />
                <div className="add-list__actions">
                  <button onClick={handleAddList}>Add List</button>
                  <button onClick={() => setIsAdding(false)}>X</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     <DragOverlay>
  {activeId ? (
    // اگر آیدی درگ شده مربوط به یک لیست بود
    state.lists.some(l => l.id === activeId) ? (
      <List 
        list={state.lists.find(l => l.id === activeId)!} 
        dispatch={dispatch} 
      />
    ) : (
      // اگر مربوط به یک کارت بود
      activeCard ? <Card card={activeCard} /> : null
    )
  ) : null}
</DragOverlay>
    </DndContext>
  );
}