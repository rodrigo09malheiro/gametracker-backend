const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db/database');

// Listar favoritos
router.get('/', auth, (req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(req.userId);
  res.json(favorites);
});

// Adicionar favorito
router.post('/', auth, (req, res) => {
  const { game_id, game_name, game_image, game_rating } = req.body;

  if (!game_id || !game_name) {
    return res.status(400).json({ error: 'Dados em falta.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO favorites (user_id, game_id, game_name, game_image, game_rating) VALUES (?, ?, ?, ?, ?)');
    stmt.run(req.userId, game_id, game_name, game_image, game_rating);
    res.status(201).json({ message: 'Adicionado aos favoritos!' });
  } catch {
    res.status(409).json({ error: 'Jogo já está nos favoritos.' });
  }
});

// Remover favorito
router.delete('/:gameId', auth, (req, res) => {
  const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?');
  stmt.run(req.userId, req.params.gameId);
  res.json({ message: 'Removido dos favoritos.' });
});

module.exports = router;