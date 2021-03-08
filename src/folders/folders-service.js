const FoldersService = {
  getFolders(db) {
    return db
      .select('*')
      .from('folders')
  },

  getByFolderId(db, folder_id) {
    return db
      .select('*')
      .from('folders')
      .where('id', folder_id)
      .first();
  },

  insertFolder(db, newFolder) {
    return db
      .insert(newFolder)
      .into('folders')
      .returning('*')
      .then(([folder]) => folder);
  },

  deleteFolder(db, folder_id) {
    return db('folders')
      .where('id', folder_id)
      .delete();
  },
};

module.exports = FoldersService;