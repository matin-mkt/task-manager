import List from '../list/List';

export default function Board() {
  return (
    <div className="board">
      <h1 className="board__title">Demo Board</h1>

      <div className="board__lists">
        <List title="Todo" />
        <List title="In Progress" />
        <List title="Done" />

        <div
          className="list"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
        >
          + Add another list
        </div>
      </div>
    </div>
  );
}
