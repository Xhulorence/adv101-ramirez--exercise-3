type PetType = "dog" | "cat";

type PetNote = {
  id: string;
  title: string;
  description: string;
  petType: PetType;
  createdAt: string;
};

type PetNoteItemProps = {
  note: PetNote;
  index: number;
  onEdit: (note: PetNote) => void;
  onDelete: (id: string) => void;
};

export default function PetNoteItem({ note, index, onEdit, onDelete }: PetNoteItemProps) {
  const createdDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(note.createdAt));
  const petEmoji = note.petType === "dog" ? "🐶" : "🐱";

  return (
    <article className={`note-card note-card-${index % 4}`}>
      <div className="note-card-topline">
        <span className={`pet-badge pet-badge-${note.petType}`}>
          <span aria-hidden="true">{petEmoji}</span> {note.petType === "dog" ? "Dog" : "Cat"}
        </span>
        <span className="note-date">{createdDate}</span>
      </div>
      <h3>{note.title}</h3>
      <p className="note-description">{note.description}</p>
      <div className="note-card-actions">
        <button className="edit-button" type="button" onClick={() => onEdit(note)}>
          <span aria-hidden="true">✎</span> Edit
        </button>
        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(note.id)}
          aria-label={`Delete ${note.title}`}
          title="Delete schedule"
        >
          <span aria-hidden="true">🦴</span>
        </button>
      </div>
    </article>
  );
}