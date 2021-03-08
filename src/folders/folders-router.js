const express = require('express');
const foldersRouter = express.Router()
const path = require('path');
const bodyParser = express.json();
const FoldersService = require('./folders-service');

const xss = require('xss');

const serializeFolder = folder => {
  return {
    ...folder,
    name: xss(folder.name),
  };
};

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getFolders(req.app.get('db'))
      .then(folders => {
        return folders.map(folder => serializeFolder(folder));
      })
      .then(folders =>
        res
          .status(200)
          .json(folders))
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({
          error: { message: `Missing 'name' in request body` }
        });

    const newFolder ={
      name
    }

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);

  });

foldersRouter
  .route('/:folder_id')
  .get((req, res, next) => {
    const { folder_id } = req.params;

    FoldersService.getByFolderId(
      req.app.get('db'),
      folder_id
    )
      .then(folder => {
        if (!folder) {
          return res
            .status(404)
            .json({
              error: {
                message: `Folder with id '${folder_id}' not found`
              }
            });
        }
        return res
        .status(200)
        .json(serializeFolder(folder));
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.getByFolderId(
      req.app.get('db'),
      folder_id
    )
      .then(folder => {
        if (!folder) {
          return res
            .status(404)
            .json({
              error: {
                message: `Folder with id '${folder_id}' not found`
              }
            });
        }
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = foldersRouter;