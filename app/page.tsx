"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import PetNoteItem from "@/components/PetNoteItem";

type PetType = "dog" | "cat";

type Note = {
  id: string;
  title: string;
  description: string;
  petType: PetType;
  createdAt: string;
};

const notesStorageKey = "paw-whisker-care-notes";

function isStoredNote(value: unknown): value is Note {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "string" &&
    "title" in value && typeof value.title === "string" &&
    "description" in value && typeof value.description === "string" &&
    "petType" in value && (value.petType === "dog" || value.petType === "cat") &&
    "createdAt" in value && typeof value.createdAt === "string"
  );
}

function isStoredNoteList(value: unknown): value is Note[] {
  return Array.isArray(value) && value.every(isStoredNote);
}

function isDuplicateTitle(title: string, notes: Note[], editingId: string | null) {
  const normalizedTitle = title.trim().toLowerCase();
  return normalizedTitle.length > 0 && notes.some(
    (note) =>
      note.id !== editingId &&
      note.title.trim().toLowerCase() === normalizedTitle,
  );
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [petType, setPetType] = useState<PetType>("dog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasDuplicateTitle = isDuplicateTitle(title, notes, editingId);

  useEffect(() => {
    let storedNotes: Note[] = [];

    try {
      const savedNotes = window.localStorage.getItem(notesStorageKey);
      if (savedNotes) {
        const parsedNotes: unknown = JSON.parse(savedNotes);
        if (isStoredNoteList(parsedNotes)) storedNotes = parsedNotes;
      }
    } catch {
      storedNotes = [];
    }

    startTransition(() => {
      setNotes(storedNotes);
      setNotesLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!notesLoaded) return;

    try {
      window.localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    } catch {
      // Keep the in-memory notes available if browser storage is unavailable.
    }
  }, [notes, notesLoaded]);

  useEffect(() => {
    const titleInput = document.getElementById("note-title");
    if (titleInput instanceof HTMLInputElement) {
      titleInput.setCustomValidity(
        hasDuplicateTitle ? "A feeding note with this title already exists." : "",
      );
    }
  }, [title, notes, editingId, hasDuplicateTitle]);

  function clearForm() {
    setTitle("");
    setDescription("");
    setPetType("dog");
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription || hasDuplicateTitle) return;

    if (editingId) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === editingId
            ? { ...note, title: trimmedTitle, description: trimmedDescription, petType }
            : note,
        ),
      );
    } else {
      setNotes((currentNotes) => [
        {
          id: crypto.randomUUID(),
          title: trimmedTitle,
          description: trimmedDescription,
          petType,
          createdAt: new Date().toISOString(),
        },
        ...currentNotes,
      ]);
    }

    clearForm();
  }

  function handleEdit(note: Note) {
    setTitle(note.title);
    setDescription(note.description);
    setPetType(note.petType);
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    if (editingId === id) clearForm();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Paw and Whisker home">
          <span className="brand-mark" aria-hidden="true">🐾</span>
          <span>Paw &amp; Whisker</span>
        </a>
        <div className="topbar-note"><span aria-hidden="true">✧</span> little routines, lots of love</div>
      </header>

      <section className="welcome" id="home" aria-labelledby="page-title">
        <div className="welcome-copy">
          <p className="eyebrow"><span aria-hidden="true">🦴</span> EVERYDAY PET CARE</p>
          <h1 id="page-title">Good meals. Happy tails<span>.</span></h1>
          <p className="welcome-description">Keep every bowl, snack, and little care routine in one cozy place.</p>
        </div>
        <div className="welcome-pets" aria-hidden="true"><span>🐶</span><span>🐱</span></div>
      </section>

      <div className="workspace">
        <aside className="compose-panel" aria-labelledby="form-heading">
          <div className="panel-heading">
            <span className="heading-flower" aria-hidden="true">🦴</span>
            <div>
              <p className="eyebrow">FEEDING SCHEDULE</p>
              <h2 id="form-heading">{editingId ? "Update a routine" : "Add a routine"}</h2>
            </div>
          </div>

          <form className="note-form" onSubmit={handleSubmit}>
            <fieldset className="pet-type-fieldset">
              <legend>Who is this for?</legend>
              <div className="pet-type-toggle" role="group" aria-label="Pet type">
                <button
                  className="pet-type-button"
                  type="button"
                  aria-pressed={petType === "dog"}
                  onClick={() => setPetType("dog")}
                >
                  <span aria-hidden="true">🐶</span> Dog
                </button>
                <button
                  className="pet-type-button"
                  type="button"
                  aria-pressed={petType === "cat"}
                  onClick={() => setPetType("cat")}
                >
                  <span aria-hidden="true">🐱</span> Cat
                </button>
              </div>
            </fieldset>

            <label htmlFor="note-title">Pet name / schedule title</label>
            <input
              id="note-title"
              name="title"
              type="text"
              placeholder="e.g. Milo's breakfast"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={70}
              required
            />
            <div className="input-meta"><span>A name you&apos;ll recognize</span><span>{title.length}/70</span></div>
            {hasDuplicateTitle && (
              <p className="duplicate-warning" role="status">
                🐾 Notice: A feeding note with this title already exists!
              </p>
            )}

            <label htmlFor="note-description">Feeding instructions</label>
            <textarea
              id="note-description"
              name="description"
              placeholder="Food, portions, time, or anything to remember..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              maxLength={1000}
              required
            />
            <div className="input-meta"><span>Portions, ingredients, and timing</span><span>{description.length}/1000</span></div>

            <div className="form-actions">
              <button className="save-button" type="submit" disabled={hasDuplicateTitle}>
                <span aria-hidden="true">{editingId ? "✧" : "＋"}</span>
                {editingId ? "Save changes" : "Add schedule"}
              </button>
              {editingId && (
                <button className="cancel-button" type="button" onClick={clearForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div className="panel-footnote"><span aria-hidden="true">🐾</span> Small routines make a big difference.</div>
        </aside>

        <section className="notes-section" aria-labelledby="notes-heading">
          <div className="notes-heading-row">
            <div>
              <p className="eyebrow">THE DAILY LINEUP</p>
              <h2 id="notes-heading">Care notes <span aria-hidden="true">🐾</span></h2>
            </div>
            <span className="note-count">{notes.length} {notes.length === 1 ? "routine" : "routines"}</span>
          </div>

          {notes.length > 0 ? (
            <div className="notes-grid">
              {notes.map((note, index) => (
                <PetNoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="empty-garden">
              <span className="empty-flower" aria-hidden="true">🐾</span>
              <h3>No care notes just yet</h3>
              <p>Add a feeding routine to keep every meal and little detail close at paw.</p>
              <span className="empty-sparkle" aria-hidden="true">🦴</span>
            </div>
          )}
        </section>
      </div>

      <footer className="page-footer"><span aria-hidden="true">🐾</span> happy bowls, happy homes <span aria-hidden="true">🐾</span></footer>
    </main>
  );
}
