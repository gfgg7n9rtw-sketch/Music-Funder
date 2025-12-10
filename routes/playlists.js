const express = require('express');
const router = express.Router();
const { Playlist, PlaylistTrack } = require('../database/models');
const { isAuthenticated } = require('../middleware/auth');

// Get user's playlists
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user_id: req.session.userId })
      .sort({ created_at: -1 });

    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Create new playlist
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      user_id: req.session.userId,
      name,
      description,
      is_public: isPublic
    });

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist details with tracks
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user_id: req.session.userId
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const tracks = await PlaylistTrack.find({ playlist_id: req.params.id })
      .sort({ position: 1, added_at: 1 });

    res.json({
      playlist,
      tracks
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Update playlist
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.is_public = isPublic;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user_id: req.session.userId },
      updateData,
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete playlist
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user_id: req.session.userId
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Delete associated tracks
    await PlaylistTrack.deleteMany({ playlist_id: req.params.id });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Add track to playlist
router.post('/:id/tracks', isAuthenticated, async (req, res) => {
  try {
    const { spotifyTrackId, trackName, artistName, albumName, durationMs, previewUrl, albumArtUrl, position } = req.body;

    // Verify playlist ownership
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user_id: req.session.userId
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const track = await PlaylistTrack.create({
      playlist_id: req.params.id,
      spotify_track_id: spotifyTrackId,
      track_name: trackName,
      artist_name: artistName,
      album_name: albumName,
      duration_ms: durationMs,
      preview_url: previewUrl,
      album_art_url: albumArtUrl,
      position
    });

    res.status(201).json({
      message: 'Track added to playlist',
      track
    });
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', isAuthenticated, async (req, res) => {
  try {
    // Verify playlist ownership
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user_id: req.session.userId
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const track = await PlaylistTrack.findOneAndDelete({
      _id: req.params.trackId,
      playlist_id: req.params.id
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found in playlist' });
    }

    res.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error('Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
});

module.exports = router;
