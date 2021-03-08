const express = require('express');
const notesRouter = express.Router()
const path = require('path');
const bodyParser = express.json();
const NotesService = require('./notes-service');
const xss = require('xss');

const serializeNote = note => {
  return {
    id: note.id,
    name: xss(note.name),
    folderId: note.folder_id,
    content: note.content,
    modified: note.modified
  };
};

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        return notes.map(note => serializeNote(note));
      })
      .then(notes =>
        res
          .status(200)
          .json(notes))
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name, content, folderId } = req.body;
    const newNote = { name, content, folder_id: folderId}
    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);

  });

notesRouter
  .route('/:note_id')
  .get((req, res, next) => {
    const { note_id } = req.params;

    NotesService.getByNoteId(
      req.app.get('db'),
      note_id
    )
      .then(note => {
        if (!note) {
          return res
            .status(404)
            .json({
              error: {
                message: `Note with id '${note_id}' not found`
              }
            });
        }
        return res
        .status(200)
        .json(serializeNote(note));
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    const { note_id } = req.params;
    NotesService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(note => {
        if (!note) {
          return res
            .status(404)
            .json({
              error: {
                message: `Note with id '${note_id}' not found`
              }
            });
        }
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = notesRouter;