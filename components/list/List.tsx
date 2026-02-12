import Card from '../card/Card';

interface ListProps {
  title: string;
}

export default function List({ title }: ListProps) {
  return (
    <div className="list">
      <div className="list__header">
        <span>{title}</span>
        <span>•••</span>
      </div>

      <div className="list__cards">
        <Card title="Create interview Kanban" />
        <Card title="Review Drag & Drop" />
      </div>

      <div className="list__add-card">
        + Add another card
      </div>
    </div>
  );
}
