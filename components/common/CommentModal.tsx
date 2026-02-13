"use client";

import { useState } from "react";
import { Card, Board } from "@/utils/types/board.types";
import { BoardAction } from "@/lib/hooks/useBoard";

interface CommentModalProps {
  card: Card;
  listId: string;
  onClose: () => void;
  dispatch: React.Dispatch<BoardAction>;
}

export default function CommentModal({ card, listId, onClose, dispatch }: CommentModalProps) {
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    dispatch({
      type: "ADD_COMMENT",
      payload: {
        listId,
        cardId: card.id,
        content: commentText,
      },
    });

    setCommentText("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comments for "{card.title}"</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="comments-list">
          {card.comments.length === 0 ? (
            <p className="no-comments">No comments yet.</p>
          ) : (
            card.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-meta">
                  <span className="comment-user">You</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="comment-text">{comment.content}</div>
              </div>
            ))
          )}
        </div>

        <div className="comment-form">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button 
            className="add-comment-btn" 
            onClick={handleAddComment}
            disabled={!commentText.trim()}
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}