// Notes App JavaScript

class NotesApp {
    constructor() {
        this.notes = this.loadNotes();
        this.editingNoteId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.renderNotes();
    }

    initializeElements() {
        this.noteTitleInput = document.getElementById('noteTitle');
        this.noteContentInput = document.getElementById('noteContent');
        this.saveButton = document.getElementById('saveNote');
        this.clearButton = document.getElementById('clearNote');
        this.notesContainer = document.getElementById('notesContainer');
        this.noteCount = document.getElementById('noteCount');
    }

    attachEventListeners() {
        this.saveButton.addEventListener('click', () => this.saveNote());
        this.clearButton.addEventListener('click', () => this.clearInput());
        
        // Allow saving with Ctrl+Enter
        this.noteContentInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.saveNote();
            }
        });
    }

    loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        return savedNotes ? JSON.parse(savedNotes) : [];
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveNote() {
        const title = this.noteTitleInput.value.trim();
        const content = this.noteContentInput.value.trim();

        if (!title && !content) {
            alert('Please enter a title or content for your note.');
            return;
        }

        if (this.editingNoteId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(note => note.id === this.editingNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title: title || 'Untitled',
                    content: content,
                    updatedAt: new Date().toISOString()
                };
            }
            this.editingNoteId = null;
            this.saveButton.textContent = 'Save Note';
        } else {
            // Create new note
            const newNote = {
                id: this.generateId(),
                title: title || 'Untitled',
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
        }

        this.saveNotes();
        this.clearInput();
        this.renderNotes();
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.noteTitleInput.value = note.title;
            this.noteContentInput.value = note.content;
            this.editingNoteId = noteId;
            this.saveButton.textContent = 'Update Note';
            
            // Scroll to input section
            this.noteTitleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.noteTitleInput.focus();
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
            
            // Clear input if editing the deleted note
            if (this.editingNoteId === noteId) {
                this.clearInput();
            }
        }
    }

    clearInput() {
        this.noteTitleInput.value = '';
        this.noteContentInput.value = '';
        this.editingNoteId = null;
        this.saveButton.textContent = 'Save Note';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    renderNotes() {
        this.notesContainer.innerHTML = '';

        if (this.notes.length === 0) {
            this.notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">No notes yet. Create your first note above!</div>
                </div>
            `;
            this.noteCount.textContent = '0 notes';
            return;
        }

        this.noteCount.textContent = `${this.notes.length} ${this.notes.length === 1 ? 'note' : 'notes'}`;

        this.notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            const displayDate = note.updatedAt !== note.createdAt 
                ? `Updated ${this.formatDate(note.updatedAt)}`
                : `Created ${this.formatDate(note.createdAt)}`;

            noteCard.innerHTML = `
                <div class="note-card-header">
                    <div>
                        <div class="note-title">${this.escapeHtml(note.title)}</div>
                        <div class="note-date">${displayDate}</div>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-actions">
                    <button class="btn btn-edit" onclick="notesApp.editNote('${note.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="notesApp.deleteNote('${note.id}')">Delete</button>
                </div>
            `;

            this.notesContainer.appendChild(noteCard);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const notesApp = new NotesApp();

