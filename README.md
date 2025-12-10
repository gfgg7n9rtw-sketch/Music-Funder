# 🎵 MusicFinder - Music Discovery Web Portal

A full-stack music discovery web application with Spotify API integration, featuring user authentication, playlist management, and personalized recommendations. Built with a SoundCloud-inspired modern design.

## 📋 Project Overview

MusicFinder is a comprehensive music portal that allows users to:
- 🔍 Search for tracks, artists, and albums using Spotify's vast music catalog
- 🎧 Get personalized music recommendations
- 📝 Create and manage custom playlists
- ⭐ Save favorite tracks
- 🌐 Enjoy a responsive, mobile-friendly interface
- 🔐 Secure user authentication and session management

## 🏗️ Architecture

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB Atlas (Cloud Database)
- **Session Management**: express-session with secure cookies
- **API Integration**: Spotify Web API
- **Security**: Helmet.js, CORS, rate limiting, bcrypt password hashing

### Frontend
- **HTML5** with semantic markup for SEO optimization
- **CSS3** with modern design principles (SoundCloud-inspired)
- **Vanilla JavaScript** for dynamic interactions
- **Responsive Design** supporting mobile, tablet, and desktop devices

### Database Schema
- **Users**: User accounts with authentication
- **Playlists**: User-created playlists
- **Playlist Tracks**: Track associations with playlists
- **User Favorites**: Favorite tracks per user
- **Search History**: Track user search activity

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available)
- Spotify Developer Account (for API credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Music-Finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure MongoDB Database**
   - Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string
   - Update database credentials in `.env` file

4. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your credentials
   ```

   Required environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`: Spotify API credentials ([Get them here](https://developer.spotify.com/dashboard))
   - `SESSION_SECRET`: Random string for session encryption
   - `PORT`: Server port (default: 3000)

5. **Initialize the database**
   ```bash
   npm run init-db
   ```

6. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Spotify Integration
- `GET /api/spotify/search` - Search tracks/artists/albums
- `GET /api/spotify/tracks/:id` - Get track details
- `GET /api/spotify/artists/:id` - Get artist details
- `GET /api/spotify/recommendations` - Get personalized recommendations
- `GET /api/spotify/featured-playlists` - Get featured playlists
- `GET /api/spotify/new-releases` - Get new releases

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorites` - Get user favorites
- `POST /api/users/favorites` - Add track to favorites
- `DELETE /api/users/favorites/:trackId` - Remove from favorites

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create new playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track from playlist

## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and desktops
- Touch-friendly interface elements
- Optimized images and assets

### SEO Optimization
- Semantic HTML5 elements
- Meta tags for social sharing (Open Graph, Twitter Cards)
- Proper heading hierarchy
- Descriptive alt texts for images
- Fast loading times with optimized assets

### UI/UX Best Practices
- Consistent color scheme and typography
- Intuitive navigation
- Loading states and error handling
- Smooth transitions and animations
- Accessible design following WCAG guidelines

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: HTTP-only cookies, secure flag in production
- **Rate Limiting**: Protection against brute-force attacks
- **CORS**: Configured for specific origins
- **Helmet.js**: Security headers (CSP, XSS protection, etc.)
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries

## 📊 Database Schema

```sql
Users
- id, username, email, password_hash, display_name, avatar_url, spotify_id, created_at, updated_at

Playlists
- id, user_id, name, description, is_public, spotify_playlist_id, created_at, updated_at

Playlist_Tracks
- id, playlist_id, spotify_track_id, track_name, artist_name, album_name, duration_ms, preview_url, album_art_url, added_at, position

User_Favorites
- id, user_id, spotify_track_id, track_name, artist_name, album_art_url, added_at

Search_History
- id, user_id, query, search_type, searched_at
```

## 🛠️ Technologies Used

### Backend
- Express.js - Web framework
- PostgreSQL - Database
- pg - PostgreSQL client
- express-session - Session management
- bcryptjs - Password hashing
- axios - HTTP client for Spotify API
- helmet - Security headers
- cors - Cross-origin resource sharing
- express-rate-limit - Rate limiting
- dotenv - Environment variables

### Frontend
- HTML5
- CSS3 (Custom styling)
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter)

## 📝 Project Structure

```
Music-Finder/
├── database/
│   ├── db.js              # Database connection
│   └── init.js            # Database initialization
├── middleware/
│   └── auth.js            # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css      # Application styles
│   ├── js/
│   │   └── app.js         # Frontend JavaScript
│   └── index.html         # Main HTML file
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── spotify.js         # Spotify API routes
│   └── playlists.js       # Playlist management routes
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
├── server.js             # Application entry point
└── README.md             # This file
```

## 🎯 Module Learning Outcomes

This project demonstrates proficiency in:

- **MO2**: User interface design with responsive design, accessibility, and usability testing
- **MO3**: Full-stack web application meeting specific requirements
- **MO4**: Web security best practices (authentication, session management, data protection)

## 🌟 Future Enhancements

- Social features (follow users, share playlists)
- Advanced music player with queue management
- Integration with additional music services
- Machine learning-based recommendations
- Real-time collaboration on playlists
- Mobile application (React Native)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Nikolajs Lamans 

## 🙏 Acknowledgments

- Spotify Web API for music data
- SoundCloud for design inspiration
- PostgreSQL and Node.js communities
