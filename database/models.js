const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  display_name: {
    type: String,
    default: ''
  },
  avatar_url: {
    type: String,
    default: ''
  },
  spotify_id: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const playlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  is_public: {
    type: Boolean,
    default: false
  },
  spotify_playlist_id: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const playlistTrackSchema = new mongoose.Schema({
  playlist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  spotify_track_id: {
    type: String,
    required: true
  },
  track_name: {
    type: String,
    required: true
  },
  artist_name: {
    type: String,
    required: true
  },
  album_name: String,
  duration_ms: Number,
  preview_url: String,
  album_art_url: String,
  position: Number,
  added_at: {
    type: Date,
    default: Date.now
  }
});

const userFavoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spotify_track_id: {
    type: String,
    required: true
  },
  track_name: {
    type: String,
    required: true
  },
  artist_name: {
    type: String,
    required: true
  },
  album_art_url: String,
  added_at: {
    type: Date,
    default: Date.now
  }
});

userFavoriteSchema.index({ user_id: 1, spotify_track_id: 1 }, { unique: true });

const searchHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  search_type: String,
  searched_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const PlaylistTrack = mongoose.model('PlaylistTrack', playlistTrackSchema);
const UserFavorite = mongoose.model('UserFavorite', userFavoriteSchema);
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = {
  User,
  Playlist,
  PlaylistTrack,
  UserFavorite,
  SearchHistory
};
