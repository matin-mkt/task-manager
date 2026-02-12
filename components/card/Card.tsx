interface CardProps {
  title: string;
}

export default function Card({ title }: CardProps) {
  return (
    <div className="card">
      <div className="card__title">{title}</div>

      <div className="card__footer">
        <button className="card__comments">
          Comments (0)
        </button>
      </div>
    </div>
  );
}
