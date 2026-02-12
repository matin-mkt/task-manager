import { useReducer, useEffect } from 'react';
import { Board } from '@/utils/types/board.types';
import { initialBoard } from '@/utils/constants/initialBoard';

type BoardAction =
  | { type: 'SET_BOARD'; payload: Board }
  | { type: 'EDIT_BOARD_TITLE'; payload: string }
  | { type: 'ADD_LIST'; payload: string }
  | { type: 'DELETE_LIST'; payload: string };


  function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case 'SET_BOARD':
      return action.payload;

    case 'EDIT_BOARD_TITLE':
      return {
        ...state,
        title: action.payload,
      };

    case 'ADD_LIST':
      return {
        ...state,
        lists: [
          ...state.lists,
          {
            id: crypto.randomUUID(),
            title: action.payload,
            cards: [],
          },
        ],
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(
          (list) => list.id !== action.payload
        ),
      };

    default:
      return state;
  }
}



export function useBoard() {
  const [state, dispatch] = useReducer(
    boardReducer,
    initialBoard,
    (initial) => {
      if (typeof window === 'undefined') return initial;

      const stored = localStorage.getItem('board');
      return stored ? JSON.parse(stored) : initial;
    }
  );

  useEffect(() => {
    localStorage.setItem('board', JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
