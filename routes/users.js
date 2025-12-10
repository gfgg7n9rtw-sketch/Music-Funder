const express = require('express');
const router = express.Router();
const { User, UserFavorite } = require('../database/models');
const { isAuthenticated } = require('../middleware/auth');

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;

    const updateData = {};
    if (displayName) updateData.display_name = displayName;
    if (avatarUrl) updateData.avatar_url = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      updateData,
      { new: true }
    ).select('-password_hash');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user favorites
router.get('/favorites', isAuthenticated, async (req, res) => {
  try {
    const favorites = await UserFavorite.find({ user_id: req.session.userId })
      .sort({ added_at: -1 });

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add track to favorites
router.post('/favorites', isAuthenticated, async (req, res) => {
  try {
    const { spotifyTrackId, trackName, artistName, albumArtUrl } = req.body;

    const favorite = await UserFavorite.create({
      user_id: req.session.userId,
      spotify_track_id: spotifyTrackId,
      track_name: trackName,
      artist_name: artistName,
      album_art_url: albumArtUrl
    });

    res.status(201).json({
      message: 'Track added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove track from favorites
router.delete('/favorites/:trackId', isAuthenticated, async (req, res) => {
  try {
    const result = await UserFavorite.findOneAndDelete({
      user_id: req.session.userId,
      spotify_track_id: req.params.trackId
    });

    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Track removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

module.exports = router;
