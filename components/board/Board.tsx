"use client";

import { useEffect, useRef, useState } from "react";
import { useBoard } from "@/lib/hooks/useBoard";
import List from "../list/List";

export default function Board() {
  const { state, dispatch } = useBoard();

  const [isAdding, setIsAdding] = useState(false);
  const [listTitle, setListTitle] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddList();
    }
  };

  return (
    <div className="board">
      <h1 className="board__title">{state.title}</h1>

      <div className="board__lists">
        {state.lists.map((list) => (
          <List key={list.id} list={list} dispatch={dispatch} />
        ))}

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
  );
}
