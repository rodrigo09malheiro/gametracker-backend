const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const wishlistRoutes = require('./routes/wishlist');
const reviewsRoutes = require('./routes/reviews');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GameTracker API a funcionar!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});