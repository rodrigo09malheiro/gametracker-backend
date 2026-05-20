const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db/database');

// Listar reviews do utilizador
router.get('/', auth, (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE user_id = ?').all(req.userId);
  res.json(reviews);
});

// Listar reviews de um jogo
router.get('/game/:gameId', (req, res) => {
  const reviews = db.prepare('SELECT reviews.*, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.game_id = ?').all(req.params.gameId);
  res.json(reviews);
});

// Adicionar review
router.post('/', auth, (req, res) => {
  const { game_id, game_name, rating, comment } = req.body;

  if (!game_id || !game_name || !rating) {
    return res.status(400).json({ error: 'Dados em falta.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating deve ser entre 1 e 5.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO reviews (user_id, game_id, game_name, rating, comment) VALUES (?, ?, ?, ?, ?)');
    stmt.run(req.userId, game_id, game_name, rating, comment);
    res.status(201).json({ message: 'Review adicionada!' });
  } catch {
    res.status(409).json({ error: 'Já fizeste uma review deste jogo.' });
  }
});

// Remover review
router.delete('/:gameId', auth, (req, res) => {
  const stmt = db.prepare('DELETE FROM reviews WHERE user_id = ? AND game_id = ?');
  stmt.run(req.userId, req.params.gameId);
  res.json({ message: 'Review removida.' });
});

module.exports = router;