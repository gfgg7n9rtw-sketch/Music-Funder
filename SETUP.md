# MusicFinder Setup Guide

## Quick Start Checklist

### 1. MongoDB Atlas Setup
- [ ] Create free account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (free tier M0)
- [ ] Create a database user with password
- [ ] Get your connection string

### 2. Spotify API Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details:
   - **App Name**: MusicFinder
   - **App Description**: Music discovery web portal
   - **Redirect URI**: `http://localhost:3000/api/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 3. Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicfinder

   # Session
   SESSION_SECRET=generate_a_random_string_here

   # Spotify
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback

   # App
   APP_URL=http://localhost:3000
   ```

### 4. Initialize Database
Run the database initialization script:
```bash
npm run init-db
```

This will create all required tables:
- users
- playlists
- playlist_tracks
- user_favorites
- search_history

### 5. Start the Application

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database `musicfinder` exists
- Test connection: `psql -U postgres -d musicfinder`

### Spotify API Issues
- Verify Client ID and Secret are correct
- Ensure Redirect URI matches in Spotify Dashboard
- Check if API credentials are properly set in `.env`

### Port Already in Use
If port 3000 is already in use, change the PORT in `.env`:
```env
PORT=3001
```

### Module Not Found
If you get module errors, reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Testing the Application

### 1. User Registration
- Click "Sign Up" in the header
- Create a new account
- Verify successful registration and automatic login

### 2. Search Functionality
- Use the search bar to find tracks/artists
- Test with queries like "The Beatles", "Bohemian Rhapsody"

### 3. Spotify Integration
- Check "Discover" tab for featured playlists
- View new releases
- Test recommendations

### 4. Playlist Management
- Go to "My Playlists" tab
- Create a new playlist
- Add tracks to playlists

### 5. Favorites
- Add tracks to favorites
- View favorites in "Favorites" tab
- Remove tracks from favorites

## Development Tips

### Database Reset
To reset the database:
```bash
# Drop and recreate database (PostgreSQL)
psql -U postgres
DROP DATABASE musicfinder;
CREATE DATABASE musicfinder;
\q

# Reinitialize
npm run init-db
```

### View Database Tables
```bash
psql -U postgres -d musicfinder
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;  # View users
```

### Debug Mode
Enable detailed logging by setting in `.env`:
```env
NODE_ENV=development
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test search
curl http://localhost:3000/api/spotify/search?q=Beatles&type=track

# Test authentication (requires login first)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Project Structure Explanation

```
Music-Finder/
├── database/           # Database configuration and initialization
├── middleware/         # Express middleware (authentication, etc.)
├── public/            # Static frontend files
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   └── index.html    # Main HTML page
├── routes/            # API route handlers
│   ├── auth.js       # Authentication endpoints
│   ├── users.js      # User management
│   ├── spotify.js    # Spotify API integration
│   └── playlists.js  # Playlist operations
├── .env              # Environment variables (create from .env.example)
├── server.js         # Main application entry point
└── package.json      # Dependencies and scripts
```

## Security Notes

⚠️ **Important Security Reminders**:
1. Never commit `.env` file to version control
2. Change `SESSION_SECRET` to a strong random string
3. In production, use HTTPS and set `NODE_ENV=production`
4. Regularly update dependencies: `npm update`
5. Use strong passwords for database and user accounts

## Next Steps

After successful setup:
1. Customize the design to match your preferences
2. Add more Spotify API features
3. Implement additional user features
4. Deploy to a production server (Heroku, AWS, DigitalOcean)
5. Add automated tests
6. Set up CI/CD pipeline

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review Spotify API documentation: https://developer.spotify.com/documentation/web-api
- Review Express.js documentation: https://expressjs.com
- Review PostgreSQL documentation: https://www.postgresql.org/docs
