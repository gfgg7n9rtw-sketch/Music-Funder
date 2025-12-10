// API Base URL
const API_URL = window.location.origin;

// State Management
let currentUser = null;
let currentTab = 'discover';

// DOM Elements
const authModal = document.getElementById('authModal');
const authSection = document.getElementById('authSection');
const loginForm = document.getElementById('loginFormElement');
const registerForm = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const closeModal = document.querySelector('.close');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const heroSection = document.getElementById('heroSection');
const dashboardSection = document.getElementById('dashboardSection');
const searchSection = document.getElementById('searchSection');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    initHeroSlider();
});

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            showDashboard();
        } else {
            showHero();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showHero();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    closeModal.onclick = () => authModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    };
    
    showRegisterBtn.onclick = (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    };
    
    showLoginBtn.onclick = (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    };
    
    // Form submissions
    loginForm.onsubmit = handleLogin;
    registerForm.onsubmit = handleRegister;
    
    // Search
    searchBtn.onclick = handleSearch;
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };
    
    // Autocomplete search
    let searchTimeout;
    searchInput.oninput = (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            hideAutocomplete();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            showAutocomplete(query);
        }, 300); // Debounce 300ms
    };
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-search')) {
            hideAutocomplete();
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
    
    // Logo click
    document.querySelector('.logo').onclick = () => {
        if (currentUser) {
            showDashboard();
        } else {
            location.reload();
        }
    };
}

// Show Hero Section
function showHero() {
    heroSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    searchSection.style.display = 'none';
    
    authSection.innerHTML = `
        <button class="btn-login" id="btnShowLogin">Sign In</button>
        <button class="btn-signup" id="btnShowSignup">Sign Up</button>
    `;
    
    // Add event listeners to dynamically created buttons
    document.getElementById('btnShowLogin')?.addEventListener('click', showLoginModal);
    document.getElementById('btnShowSignup')?.addEventListener('click', showSignupModal);
    
    // Load public music content
    loadPublicContent();
}

// Show Dashboard
function showDashboard() {
    heroSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    searchSection.style.display = 'none';
    
    document.getElementById('userDisplayName').textContent = currentUser.displayName || currentUser.username;
    
    authSection.innerHTML = `
        <span style="color: var(--text-secondary);">Hello, ${currentUser.username}</span>
        <button class="btn-logout" id="btnLogout">Sign Out</button>
    `;
    
    // Add event listener to logout button
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
    
    loadDashboardContent();
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    authModal.style.display = 'block';
}

function showSignupModal() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    authModal.style.display = 'block';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authModal.style.display = 'none';
            showMessage('Login successful!', 'success');
            showDashboard();
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const displayName = document.getElementById('registerDisplayName').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, displayName, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authModal.style.display = 'none';
            showMessage('Account created successfully!', 'success');
            showDashboard();
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        showMessage('Logged out successfully', 'success');
        showHero();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show Message
function showMessage(message, type) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Switch Tab
function switchTab(tab) {
    currentTab = tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    if (tab === 'playlists') {
        loadUserPlaylists();
    } else if (tab === 'favorites') {
        loadUserFavorites();
    }
}

// Load Dashboard Content
async function loadDashboardContent() {
    loadFeaturedPlaylists();
    loadNewReleases();
    loadRecommendations();
}

// Load Featured Playlists
async function loadFeaturedPlaylists() {
    const container = document.getElementById('featuredPlaylists');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading featured playlists...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/spotify/featured-playlists?limit=6`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Featured playlists data:', data);
        
        if (data.playlists && data.playlists.items && data.playlists.items.length > 0) {
            container.innerHTML = data.playlists.items.filter(playlist => playlist !== null).map(playlist => `
                <div class="music-card">
                    <img src="${playlist?.images?.[0]?.url || '/images/placeholder.png'}" 
                         alt="${playlist?.name || 'Playlist'}" 
                         class="music-card-image">
                    <div class="music-card-title">${playlist?.name || 'Unknown Playlist'}</div>
                    <div class="music-card-subtitle">${playlist?.description || 'Playlist'}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No playlists available</div>';
        }
    } catch (error) {
        console.error('Load featured playlists error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load playlists</div>';
    }
}

// Load New Releases
async function loadNewReleases() {
    const container = document.getElementById('newReleases');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading new releases...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/spotify/new-releases?limit=6`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('New releases data:', data);
        
        if (data.albums && data.albums.items && data.albums.items.length > 0) {
            container.innerHTML = data.albums.items.filter(album => album !== null).map(album => `
                <div class="music-card">
                    <img src="${album?.images?.[0]?.url || '/images/placeholder.png'}" 
                         alt="${album?.name || 'Album'}" 
                         class="music-card-image">
                    <div class="music-card-title">${album?.name || 'Unknown Album'}</div>
                    <div class="music-card-subtitle">${album?.artists?.[0]?.name || 'Various Artists'}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No releases available</div>';
        }
    } catch (error) {
        console.error('Load new releases error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load releases</div>';
    }
}

// Load Recommendations
async function loadRecommendations() {
    const container = document.getElementById('recommendations');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading recommendations...</div>';
    
    try {
        // Request without seed params - backend will use defaults
        const response = await fetch(`${API_URL}/api/spotify/recommendations?limit=6`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Recommendations API error:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Recommendations data:', data);
        
        if (data.tracks && data.tracks.length > 0) {
            container.innerHTML = data.tracks.map(track => createTrackCard(track)).join('');
            attachTrackCardListeners();
        } else {
            container.innerHTML = '<div class="empty-state">No recommendations available</div>';
        }
    } catch (error) {
        console.error('Load recommendations error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load recommendations</div>';
    }
}

// Create Track Card
function createTrackCard(track) {
    const trackData = JSON.stringify({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name,
        album: track.album?.name,
        image: track.album?.images[0]?.url,
        duration: track.duration_ms,
        preview: track.preview_url
    });
    
    return `
        <div class="music-card">
            <img src="${track.album?.images[0]?.url || '/images/placeholder.png'}" 
                 alt="${track.name}" 
                 class="music-card-image">
            <div class="music-card-title">${track.name}</div>
            <div class="music-card-subtitle">${track.artists[0]?.name || 'Unknown Artist'}</div>
            <div class="music-card-actions">
                <button class="btn-icon btn-favorite" data-track='${trackData.replace(/'/g, "&#39;")}' title="Add to Favorites">
                    ❤️
                </button>
                <button class="btn-icon btn-playlist" data-track='${trackData.replace(/'/g, "&#39;")}' title="Add to Playlist">
                    ➕
                </button>
            </div>
        </div>
    `;
}

// Attach event listeners to track card buttons
function attachTrackCardListeners() {
    // Favorite buttons
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackData = this.getAttribute('data-track');
            addToFavorites(trackData);
        });
    });
    
    // Playlist buttons
    document.querySelectorAll('.btn-playlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackData = this.getAttribute('data-track');
            showAddToPlaylist(trackData);
        });
    });
}

// Show Track Details (placeholder)
function showTrackDetails(track) {
    console.log('Track details:', track);
    alert(`Track: ${track.name}\nArtist: ${track.artists[0]?.name}\nAlbum: ${track.album?.name}`);
}

// Handle Search
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    searchSection.style.display = 'block';
    heroSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
        const data = await response.json();
        
        if (data.tracks && data.tracks.items.length > 0) {
            resultsContainer.innerHTML = data.tracks.items.map(track => createTrackCard(track)).join('');
            attachTrackCardListeners();
        } else {
            resultsContainer.innerHTML = '<div class="empty-state"><h3>No results found</h3><p>Try a different search term</p></div>';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<div class="empty-state">Search failed. Please try again.</div>';
    }
}

// Load User Playlists
async function loadUserPlaylists() {
    const container = document.getElementById('userPlaylists');
    container.innerHTML = '<div class="loading">Loading your playlists...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/playlists`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const playlists = await response.json();
            
            if (playlists.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No playlists yet</h3><p>Create your first playlist!</p></div>';
            } else {
                container.innerHTML = playlists.map(playlist => `
                    <div class="playlist-card">
                        <h3>${playlist.name}</h3>
                        <p>${playlist.description || 'No description'}</p>
                        <small>Created: ${new Date(playlist.created_at).toLocaleDateString()}</small>
                        <button class="delete-playlist-btn" data-playlist-id="${playlist._id}">Delete</button>
                    </div>
                `).join('');
                
                // Attach delete listeners using event delegation
                container.querySelectorAll('.delete-playlist-btn').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const playlistId = this.getAttribute('data-playlist-id');
                        
                        if (!confirm('Are you sure you want to delete this playlist?')) {
                            return;
                        }
                        
                        try {
                            const response = await fetch(`${API_URL}/api/playlists/${playlistId}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            });
                            
                            if (response.ok) {
                                alert('Playlist deleted successfully');
                                loadUserPlaylists(); // Reload playlists
                            } else {
                                const data = await response.json();
                                alert(data.error || 'Failed to delete playlist');
                            }
                        } catch (error) {
                            console.error('Delete playlist error:', error);
                            alert('Failed to delete playlist');
                        }
                    });
                });
            }
        } else {
            container.innerHTML = '<div class="empty-state">Failed to load playlists</div>';
        }
    } catch (error) {
        console.error('Load playlists error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load playlists</div>';
    }
}

// Load User Favorites
async function loadUserFavorites() {
    const container = document.getElementById('userFavorites');
    container.innerHTML = '<div class="loading">Loading your favorites...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/users/favorites`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const favorites = await response.json();
            
            if (favorites.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>No favorites yet</h3><p>Start adding tracks to your favorites!</p></div>';
            } else {
                container.innerHTML = favorites.map(fav => `
                    <div class="track-item">
                        <img src="${fav.album_art_url || '/images/placeholder.png'}" 
                             alt="${fav.track_name}" 
                             class="track-image">
                        <div class="track-info">
                            <div class="track-name">${fav.track_name}</div>
                            <div class="track-artist">${fav.artist_name}</div>
                        </div>
                        <div class="track-actions">
                            <button class="btn-remove-favorite" data-track-id="${fav.spotify_track_id}">Remove</button>
                        </div>
                    </div>
                `).join('');
                
                // Attach event listeners to remove buttons
                container.querySelectorAll('.btn-remove-favorite').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const trackId = this.getAttribute('data-track-id');
                        removeFavorite(trackId);
                    });
                });
            }
        } else {
            container.innerHTML = '<div class="empty-state">Failed to load favorites</div>';
        }
    } catch (error) {
        console.error('Load favorites error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load favorites</div>';
    }
}

// Remove Favorite
async function removeFavorite(trackId) {
    try {
        const response = await fetch(`${API_URL}/api/users/favorites/${trackId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadUserFavorites();
        }
    } catch (error) {
        console.error('Remove favorite error:', error);
    }
}

// Create Playlist Button
document.addEventListener('DOMContentLoaded', () => {
    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    if (createPlaylistBtn) {
        createPlaylistBtn.onclick = async () => {
            const name = prompt('Enter playlist name:');
            if (!name) return;
            
            const description = prompt('Enter playlist description (optional):');
            
            try {
                const response = await fetch(`${API_URL}/api/playlists`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, description, isPublic: false })
                });
                
                if (response.ok) {
                    loadUserPlaylists();
                }
            } catch (error) {
                console.error('Create playlist error:', error);
            }
        };
    }
});

// Autocomplete functions
async function showAutocomplete(query) {
    try {
        const response = await fetch(`${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}&type=artist,track&limit=5`);
        const data = await response.json();
        
        let autocompleteContainer = document.getElementById('autocompleteResults');
        if (!autocompleteContainer) {
            autocompleteContainer = document.createElement('div');
            autocompleteContainer.id = 'autocompleteResults';
            autocompleteContainer.className = 'autocomplete-results';
            document.querySelector('.navbar-search').appendChild(autocompleteContainer);
        }
        
        let html = '';
        
        // Artists
        if (data.artists && data.artists.items.length > 0) {
            html += '<div class="autocomplete-section"><div class="autocomplete-title">ARTISTS</div>';
            data.artists.items.slice(0, 3).forEach(artist => {
                html += `
                    <div class="autocomplete-item" data-type="artist" data-name="${artist.name.replace(/"/g, '&quot;')}">
                        <img src="${artist.images[0]?.url || '/images/placeholder.png'}" class="autocomplete-img">
                        <div>
                            <div class="autocomplete-name">${artist.name}</div>
                            <div class="autocomplete-type">Artist</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Tracks
        if (data.tracks && data.tracks.items.length > 0) {
            html += '<div class="autocomplete-section"><div class="autocomplete-title">TRACKS</div>';
            data.tracks.items.slice(0, 3).forEach(track => {
                html += `
                    <div class="autocomplete-item" data-type="track" data-name="${track.name.replace(/"/g, '&quot;')}">
                        <img src="${track.album?.images[0]?.url || '/images/placeholder.png'}" class="autocomplete-img">
                        <div>
                            <div class="autocomplete-name">${track.name}</div>
                            <div class="autocomplete-type">${track.artists[0]?.name || 'Unknown'}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (html === '') {
            html = '<div class="autocomplete-empty">No results found</div>';
        }
        
        autocompleteContainer.innerHTML = html;
        autocompleteContainer.style.display = 'block';
        
        // Add click handlers to autocomplete items
        autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.getAttribute('data-name');
                searchInput.value = name;
                hideAutocomplete();
                handleSearch();
            });
        });
    } catch (error) {
        console.error('Autocomplete error:', error);
    }
}

function hideAutocomplete() {
    const container = document.getElementById('autocompleteResults');
    if (container) {
        container.style.display = 'none';
    }
}

// Add to Favorites
async function addToFavorites(trackDataString) {
    if (!currentUser) {
        alert('Please sign in to add favorites');
        showLoginModal();
        return;
    }
    
    try {
        const trackData = JSON.parse(trackDataString);
        
        const response = await fetch(`${API_URL}/api/users/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                spotifyTrackId: trackData.id,
                trackName: trackData.name,
                artistName: trackData.artist,
                albumArtUrl: trackData.image
            })
        });
        
        if (response.ok) {
            alert('✅ Added to favorites!');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to add to favorites');
        }
    } catch (error) {
        console.error('Add to favorites error:', error);
        alert('Failed to add to favorites');
    }
}

// Show Add to Playlist Modal
async function showAddToPlaylist(trackDataString) {
    if (!currentUser) {
        alert('Please sign in to add to playlist');
        showLoginModal();
        return;
    }
    
    try {
        // Load user playlists
        const response = await fetch(`${API_URL}/api/playlists`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            alert('Failed to load playlists');
            return;
        }
        
        const playlists = await response.json();
        
        if (playlists.length === 0) {
            const create = confirm('You have no playlists. Create one now?');
            if (create) {
                await createNewPlaylist();
            }
            return;
        }
        
        // Show playlist selection
        let playlistOptions = 'Select a playlist:\n\n';
        playlists.forEach((pl, idx) => {
            playlistOptions += `${idx + 1}. ${pl.name}\n`;
        });
        playlistOptions += '\nEnter playlist number:';
        
        const selection = prompt(playlistOptions);
        if (!selection) return;
        
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < playlists.length) {
            await addTrackToPlaylist(playlists[index]._id, trackDataString);
        } else {
            alert('Invalid selection');
        }
    } catch (error) {
        console.error('Show add to playlist error:', error);
        alert('Failed to show playlists');
    }
}

// Add Track to Playlist
async function addTrackToPlaylist(playlistId, trackDataString) {
    try {
        const trackData = JSON.parse(trackDataString);
        
        const response = await fetch(`${API_URL}/api/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                spotifyTrackId: trackData.id,
                trackName: trackData.name,
                artistName: trackData.artist,
                albumName: trackData.album,
                durationMs: trackData.duration,
                previewUrl: trackData.preview,
                albumArtUrl: trackData.image
            })
        });
        
        if (response.ok) {
            alert('✅ Added to playlist!');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to add to playlist');
        }
    } catch (error) {
        console.error('Add to playlist error:', error);
        alert('Failed to add to playlist');
    }
}

// Create New Playlist
async function createNewPlaylist() {
    const name = prompt('Enter playlist name:');
    if (!name) return;
    
    const description = prompt('Enter playlist description (optional):');
    
    try {
        const response = await fetch(`${API_URL}/api/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, description, isPublic: false })
        });
        
        if (response.ok) {
            alert('✅ Playlist created!');
            if (currentTab === 'playlists') {
                loadUserPlaylists();
            }
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to create playlist');
        }
    } catch (error) {
        console.error('Create playlist error:', error);
        alert('Failed to create playlist');
    }
}

// Load Public Content (for hero page)
async function loadPublicContent() {
    loadPopularArtists();
    loadHeroNewReleases();
    loadPopularTracks();
}

// Load Popular Artists
async function loadPopularArtists() {
    const container = document.getElementById('popularArtists');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading popular artists...</div>';
    
    try {
        // Search for popular artists
        const response = await fetch(`${API_URL}/api/spotify/search?q=genre:pop&type=artist&limit=6`);
        const data = await response.json();
        
        if (data.artists && data.artists.items.length > 0) {
            container.innerHTML = data.artists.items.filter(artist => artist !== null).map(artist => `
                <div class="music-card">
                    <img src="${artist?.images?.[0]?.url || '/images/placeholder.png'}" 
                         alt="${artist?.name || 'Artist'}" 
                         class="music-card-image">
                    <div class="music-card-title">${artist?.name || 'Unknown Artist'}</div>
                    <div class="music-card-subtitle">Artist</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No artists found</div>';
        }
    } catch (error) {
        console.error('Load popular artists error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load artists</div>';
    }
}

// Load Hero New Releases
async function loadHeroNewReleases() {
    const container = document.getElementById('heroNewReleases');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading new releases...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/spotify/new-releases?limit=6`);
        const data = await response.json();
        
        if (data.albums && data.albums.items.length > 0) {
            container.innerHTML = data.albums.items.filter(album => album !== null).map(album => `
                <div class="music-card">
                    <img src="${album?.images?.[0]?.url || '/images/placeholder.png'}" 
                         alt="${album?.name || 'Album'}" 
                         class="music-card-image">
                    <div class="music-card-title">${album?.name || 'Unknown Album'}</div>
                    <div class="music-card-subtitle">${album?.artists?.[0]?.name || 'Various'}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No releases found</div>';
        }
    } catch (error) {
        console.error('Load new releases error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load releases</div>';
    }
}

// Load Popular Tracks
async function loadPopularTracks() {
    const container = document.getElementById('popularTracks');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading popular tracks...</div>';
    
    try {
        // Search for popular tracks
        const response = await fetch(`${API_URL}/api/spotify/search?q=year:2024&type=track&limit=6`);
        const data = await response.json();
        
        if (data.tracks && data.tracks.items.length > 0) {
            container.innerHTML = data.tracks.items.map(track => createTrackCard(track)).join('');
            attachTrackCardListeners();
        } else {
            container.innerHTML = '<div class="empty-state">No tracks found</div>';
        }
    } catch (error) {
        console.error('Load popular tracks error:', error);
        container.innerHTML = '<div class="empty-state">Failed to load tracks</div>';
    }
}

// Hero Slider
function initHeroSlider() {
    const slides = [
        {
            title: 'Discover.<br>Get Discovered.',
            subtitle: 'Discover your next obsession, or become someone else\'s.<br>MusicFinder is the only community where fans and artists come together<br>to discover and connect through music.',
            gradient: 'linear-gradient(135deg, #ff5500 0%, #1a1a1a 50%, #111111 100%)'
        },
        {
            title: 'Never Stop<br>Listening.',
            subtitle: 'Connect with millions of tracks and explore new music every day.<br>Your perfect playlist is waiting to be discovered.<br>Join the community and share your passion for music.',
            gradient: 'linear-gradient(135deg, #ff3366 0%, #1a1a1a 50%, #111111 100%)'
        },
        {
            title: 'Your Music,<br>Your Way.',
            subtitle: 'Create unlimited playlists, save your favorites, and get personalized recommendations.<br>Everything you need to enjoy music, all in one place.<br>Start your musical journey today.',
            gradient: 'linear-gradient(135deg, #6600ff 0%, #1a1a1a 50%, #111111 100%)'
        }
    ];
    
    let currentSlide = 0;
    const heroBanner = document.querySelector('.hero-banner');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!heroBanner || !heroTitle || !heroSubtitle) {
        console.log('Hero elements not found');
        return;
    }
    
    function changeSlide(index) {
        currentSlide = index;
        const slide = slides[currentSlide];
        
        // Update background
        heroBanner.style.background = slide.gradient;
        
        // Update content with fade effect
        heroTitle.style.opacity = '0';
        heroSubtitle.style.opacity = '0';
        
        setTimeout(() => {
            heroTitle.innerHTML = slide.title;
            heroSubtitle.innerHTML = slide.subtitle;
            heroTitle.style.opacity = '1';
            heroSubtitle.style.opacity = '1';
        }, 300);
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentSlide);
        });
    }
    
    // Click handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            changeSlide(index);
        });
    });
    
    // Auto-play slider
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        changeSlide(currentSlide);
    }, 5000);
    
    console.log('Hero slider initialized');
}

