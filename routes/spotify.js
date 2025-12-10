const express = require('express');
const router = express.Router();
const axios = require('axios');
const { SearchHistory } = require('../database/models');
const { isAuthenticated } = require('../middleware/auth');

// Spotify API credentials
let spotifyToken = null;
let tokenExpiresAt = 0;

// Get Spotify access token
const getSpotifyToken = async () => {
  if (spotifyToken && Date.now() < tokenExpiresAt) {
    return spotifyToken;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64')
        }
      }
    );

    spotifyToken = response.data.access_token;
    tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    return spotifyToken;
  } catch (error) {
    console.error('Spotify token error:', error.response?.data || error.message);
    throw new Error('Failed to get Spotify access token');
  }
};

// Search tracks
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { q, type, limit }
    });

    // Save search history if user is authenticated
    if (req.session && req.session.userId) {
      await SearchHistory.create({
        user_id: req.session.userId,
        query: q,
        search_type: type
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get track details
router.get('/tracks/:id', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${req.params.id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get track error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

// Get artist details
router.get('/artists/:id', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${req.params.id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get artist error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get artist' });
  }
});

// Get artist's top tracks
router.get('/artists/:id/top-tracks', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const market = req.query.market || 'US';

    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${req.params.id}/top-tracks`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { market }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get top tracks error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get top tracks' });
  }
});

// Get recommendations (using search as fallback)
router.get('/recommendations', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const token = await getSpotifyToken();
    
    // Use search for popular tracks instead of recommendations endpoint
    const response = await axios.get(
      'https://api.spotify.com/v1/search',
      {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { 
          q: 'year:2024',
          type: 'track',
          limit: limit
        }
      }
    );

    res.json({ tracks: response.data.tracks.items });
  } catch (error) {
    console.error('Get recommendations error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.response?.data });
  }
});

// Get featured playlists (using search as fallback)
router.get('/featured-playlists', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const { limit = 10 } = req.query;
    
    // Use search for playlists instead of browse endpoint
    const response = await axios.get(
      'https://api.spotify.com/v1/search',
      {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { 
          q: 'hits',
          type: 'playlist',
          limit: limit
        }
      }
    );

    res.json({ playlists: response.data.playlists });
  } catch (error) {
    console.error('Get featured playlists error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get featured playlists', details: error.response?.data });
  }
});

// Get new releases (using search as fallback)
router.get('/new-releases', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const { limit = 20 } = req.query;

    // Use search for recent albums instead of browse endpoint
    const response = await axios.get(
      'https://api.spotify.com/v1/search',
      {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { 
          q: 'tag:new',
          type: 'album',
          limit: limit
        }
      }
    );

    res.json({ albums: response.data.albums });
  } catch (error) {
    console.error('Get new releases error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get new releases', details: error.response?.data });
  }
});

module.exports = router;
