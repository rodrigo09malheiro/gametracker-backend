const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// GET perfil
router.get('/', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
  res.json(user);
});

// PUT atualizar perfil
router.put('/', authMiddleware, (req, res) => {
  const { username, email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

  const newUsername = username || user.username;
  const newEmail = email || user.email;
  const newPassword = password ? bcrypt.hashSync(password, 10) : user.password;

  try {
    db.prepare('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?')
      .run(newUsername, newEmail, newPassword, req.user.id);
    res.json({ message: 'Perfil atualizado!', username: newUsername });
  } catch {
    res.status(409).json({ error: 'Username ou email já existe.' });
  }
});

// POST upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ficheiro inválido.' });
  const avatarUrl = `/uploads/${req.file.filename}`;
  try {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, req.user.id);
    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;