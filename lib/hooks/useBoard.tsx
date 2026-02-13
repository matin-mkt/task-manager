"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Board, List, Card, Comment } from "@/utils/types/board.types";
import { initialBoard } from "@/utils/constants/initialBoard"; 

// --- Types & Actions ---
export type BoardAction =
  | { type: "SET_BOARD"; payload: Board }
  | { type: "EDIT_BOARD_TITLE"; payload: string }
  | { type: "ADD_LIST"; payload: { title: string } }
  | { type: "EDIT_LIST_TITLE"; payload: { listId: string; title: string } }
  | { type: "DELETE_LIST"; payload: { listId: string } }
  | { type: "CLEAR_LIST"; payload: { listId: string } }
  | { type: "REORDER_LISTS"; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: "ADD_CARD"; payload: { listId: string; title: string } }
  | { type: "EDIT_CARD_TITLE"; payload: { listId: string; cardId: string; title: string } }
  | { type: "DELETE_CARD"; payload: { listId: string; cardId: string } }
  | { type: "MOVE_CARD"; payload: { sourceListId: string; destinationListId: string; sourceIndex: number; destinationIndex: number } }
  | { type: "ADD_COMMENT"; payload: { listId: string; cardId: string; content: string } };

// --- Reducer Logic ---
function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case "SET_BOARD":
      return action.payload;

    case "EDIT_BOARD_TITLE":
      return { ...state, title: action.payload };

    case "ADD_LIST":
      const newList: List = {
        id: crypto.randomUUID(),
        title: action.payload.title,
        cards: [],
      };
      return { ...state, lists: [...state.lists, newList] };

    case "EDIT_LIST_TITLE":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.listId ? { ...l, title: action.payload.title } : l
        ),
      };

    case "DELETE_LIST":
      return { ...state, lists: state.lists.filter((l) => l.id !== action.payload.listId) };

    case "CLEAR_LIST":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.listId ? { ...l, cards: [] } : l
        ),
      };

    case "REORDER_LISTS": {
      const newLists = [...state.lists];
      const [removed] = newLists.splice(action.payload.sourceIndex, 1);
      newLists.splice(action.payload.destinationIndex, 0, removed);
      return { ...state, lists: newLists };
    }

    case "ADD_CARD": {
      const newCard: Card = {
        id: crypto.randomUUID(),
        title: action.payload.title,
        comments: [],
      };
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.listId ? { ...l, cards: [...l.cards, newCard] } : l
        ),
      };
    }

    case "EDIT_CARD_TITLE":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.listId
            ? {
                ...l,
                cards: l.cards.map((c) =>
                  c.id === action.payload.cardId ? { ...c, title: action.payload.title } : c
                ),
              }
            : l
        ),
      };

    case "MOVE_CARD": {
      const { sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
      const sourceList = state.lists.find((l) => l.id === sourceListId);
      const destList = state.lists.find((l) => l.id === destinationListId);

      if (!sourceList || !destList) return state;

      const sourceCards = [...sourceList.cards];
      const [movedCard] = sourceCards.splice(sourceIndex, 1);
      
      if (!movedCard) return state; // Safety check

      if (sourceListId === destinationListId) {
        sourceCards.splice(destinationIndex, 0, movedCard);
        return {
          ...state,
          lists: state.lists.map((l) => (l.id === sourceListId ? { ...l, cards: sourceCards } : l)),
        };
      } else {
        const destCards = [...destList.cards];
        destCards.splice(destinationIndex, 0, movedCard);
        return {
          ...state,
          lists: state.lists.map((l) => {
            if (l.id === sourceListId) return { ...l, cards: sourceCards };
            if (l.id === destinationListId) return { ...l, cards: destCards };
            return l;
          }),
        };
      }
    }

    case "ADD_COMMENT": {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        content: action.payload.content,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.payload.listId
            ? {
                ...l,
                cards: l.cards.map((c) =>
                  c.id === action.payload.cardId
                    ? { ...c, comments: [newComment, ...c.comments] }
                    : c
                ),
              }
            : l
        ),
      };
    }

    default:
      return state;
  }
}

// --- Context & Provider ---
interface BoardContextType {
  state: Board;
  dispatch: React.Dispatch<BoardAction>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialBoard);

  // Load from LocalStorage
  useEffect(() => {
    const savedBoard = localStorage.getItem("trello-clone-board");
    if (savedBoard) {
      try {
        dispatch({ type: "SET_BOARD", payload: JSON.parse(savedBoard) });
      } catch (e) {
        console.error("Failed to load board", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("trello-clone-board", JSON.stringify(state));
  }, [state]);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

// Custom Hook
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};