const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db/database');

// Listar wishlist
router.get('/', auth, (req, res) => {
  const wishlist = db.prepare('SELECT * FROM wishlist WHERE user_id = ?').all(req.user.id);
  res.json(wishlist);
});

// Adicionar à wishlist
router.post('/', auth, (req, res) => {
  const { game_id, game_name, game_image, game_rating } = req.body;

  if (!game_id || !game_name) {
    return res.status(400).json({ error: 'Dados em falta.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO wishlist (user_id, game_id, game_name, game_image, game_rating) VALUES (?, ?, ?, ?, ?)');
    stmt.run(req.user.id, game_id, game_name, game_image, game_rating);
    res.status(201).json({ message: 'Adicionado à wishlist!' });
  } catch {
    res.status(409).json({ error: 'Jogo já está na wishlist.' });
  }
});

// Remover da wishlist
router.delete('/:gameId', auth, (req, res) => {
  const stmt = db.prepare('DELETE FROM wishlist WHERE user_id = ? AND game_id = ?');
  stmt.run(req.user.id, req.params.gameId);
  res.json({ message: 'Removido da wishlist.' });
});

module.exports = router;