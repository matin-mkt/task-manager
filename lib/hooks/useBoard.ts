import { useReducer, useEffect } from "react";
import { Board } from "@/utils/types/board.types";
import { initialBoard } from "@/utils/constants/initialBoard";
import { reorder } from "@/utils/array.utils";

// action types

type BoardAction =
  | { type: "SET_BOARD"; payload: Board }

  // Board
  | { type: "EDIT_BOARD_TITLE"; payload: string }

  // List
  | { type: "ADD_LIST"; payload: { title: string } }
  | { type: "DELETE_LIST"; payload: { listId: string } }
  | { type: "EDIT_LIST_TITLE"; payload: { listId: string; title: string } }
  | {
      type: "REORDER_LISTS";
      payload: { sourceIndex: number; destinationIndex: number };
    }

  // Card
  | { type: "ADD_CARD"; payload: { listId: string; title: string } }
  | { type: "DELETE_CARD"; payload: { listId: string; cardId: string } }
  | {
      type: "EDIT_CARD_TITLE";
      payload: { listId: string; cardId: string; title: string };
    }
  | {
      type: "MOVE_CARD";
      payload: {
        sourceListId: string;
        destinationListId: string;
        sourceIndex: number;
        destinationIndex: number;
      };
    }

  // Comment
  | {
      type: "ADD_COMMENT";
      payload: { listId: string; cardId: string; content: string };
    }
  | {
      type: "DELETE_COMMENT";
      payload: { listId: string; cardId: string; commentId: string };
    };

// reducer
function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case "SET_BOARD":
      return action.payload;

    case "EDIT_BOARD_TITLE":
      return {
        ...state,
        title: action.payload,
      };

    case "ADD_LIST":
      return {
        ...state,
        lists: [
          ...state.lists,
          {
            id: crypto.randomUUID(),
            title: action.payload.title,
            cards: [],
          },
        ],
      };

    case "REORDER_LISTS":
      return {
        ...state,
        lists: reorder(
          state.lists,
          action.payload.sourceIndex,
          action.payload.destinationIndex,
        ),
      };

    case "ADD_CARD":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                cards: [
                  ...list.cards,
                  {
                    id: crypto.randomUUID(),
                    title: action.payload.title,
                    comments: [],
                  },
                ],
              }
            : list,
        ),
      };

    case "MOVE_CARD": {
      const { sourceListId, destinationListId, sourceIndex, destinationIndex } =
        action.payload;

      const sourceList = state.lists.find((l) => l.id === sourceListId);
      const destinationList = state.lists.find(
        (l) => l.id === destinationListId,
      );

      if (!sourceList || !destinationList) return state;

      const sourceCards = [...sourceList.cards];
      const [movedCard] = sourceCards.splice(sourceIndex, 1);

      if (sourceListId === destinationListId) {
        const reordered = reorder(sourceCards, sourceIndex, destinationIndex);
        return {
          ...state,
          lists: state.lists.map((l) =>
            l.id === sourceListId ? { ...l, cards: reordered } : l,
          ),
        };
      }

      const destinationCards = [...destinationList.cards];
      destinationCards.splice(destinationIndex, 0, movedCard);

      return {
        ...state,
        lists: state.lists.map((l) => {
          if (l.id === sourceListId) {
            return { ...l, cards: sourceCards };
          }
          if (l.id === destinationListId) {
            return { ...l, cards: destinationCards };
          }
          return l;
        }),
      };
    }
    case "ADD_COMMENT":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === action.payload.cardId
                    ? {
                        ...card,
                        comments: [
                          ...card.comments,
                          {
                            id: crypto.randomUUID(),
                            content: action.payload.content,
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : card,
                ),
              }
            : list,
        ),
      };

    default:
      return state;
  }
}

// custom hook
export function useBoard() {
  const [state, dispatch] = useReducer(boardReducer, initialBoard);

  // Load from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem("board");
    if (stored) {
      dispatch({
        type: "SET_BOARD",
        payload: JSON.parse(stored),
      });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("board", JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
