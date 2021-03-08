const NotesService = {
  getAllNotes(db) {
    return db
      .select('*')
      .from('notes');
  },

  getByNoteId(db, note_id) {
    return db
      .select('*')
      .from('notes')
      .where('id', note_id)
      .first();
  },

  insertNote(db, newNote) {
    return db
      .insert(newNote)
      .into('notes')
      .returning('*')
      .then(([note]) => note);
  },

  deleteNote(db, note_id) {
    return db('notes')
      .where('id', note_id)
      .delete();
  },
};

module.exports = NotesService;