"use client";
import List from '../list/List';
import { useBoard } from '@/lib/hooks/useBoard';

export default function Board() {
  const { state } = useBoard();

  return (
    <div className="board">
      <h1 className="board__title">{state.title}</h1>

      <div className="board__lists">
        {state.lists.map((list) => (
          <List key={list.id} list={list} />
        ))}

        <div
          className="list"
          style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
        >
          + Add another list
        </div>
      </div>
    </div>
  );
}