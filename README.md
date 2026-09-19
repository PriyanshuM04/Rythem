# Rythem 🎵

A music streaming web app built for people who want a clean, simple way to discover and organize music.

## About

Rythem lets users explore songs, build their own playlists, and enjoy a smooth listening experience — all from the browser, no installs required. The project is being built in phases, with new features rolling out progressively.

## Features

### Available Now

**Auth & Accounts**
- Secure registration and login with industry-standard password hashing
- Login flexibility — sign in with either your username or email
- Email verification on signup, with a dedicated confirmation page and clear "check your email" / "confirmed, you can log in now" states
- Self-service forgot/reset password flow via emailed links
- Transactional email (confirmation, welcome, password reset) sent via Brevo

**Listening**
- Browse trending songs with paginated infinite scroll
- Recently played and full listening history (play-logging in progress)
- Like songs to save them for later
- Global, persistent player bar with play/pause, shuffle, repeat, seek, volume, like, and add-to-playlist controls

**Playlists**
- Create personal playlists, add or remove songs
- Save playlists created by others to your own library

**Artists**
- Upgrade any account to an artist profile
- Upload songs and get discovered
- Public artist profile pages

**Users**
- View account details, tier, and saved content in one place

### In Progress
- Play-logging for Recent/History (currently returns empty — backend gap being closed)
- Multi-artist song collaboration and tagging
- Full frontend wiring of the feature set above to live backend data (auth, Home, and player UI are built; several pages currently run on mock data pending API integration)

### Coming Soon
- Full player view, playlist detail page, artist dashboard, and user profile pages
- A richer listening experience with more personalization
- Expanded music catalog from a growing number of artists
- Token-based rewards and a premium subscription tier
- New ways to support the platform and unlock additional features

## Tech Stack

**Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy (ORM)
- JWT-based authentication
- Brevo (transactional email API)
- httpx

**Frontend**
- React + Vite
- Tailwind CSS v4
- Zustand (state management)
- React Router
- Axios + TanStack React Query
- Framer Motion
- Lucide React (icons)
- Howler.js (planned, for audio playback)

## Project Structure

```
Rythem/
├── backend/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── artist.py
│   │   ├── like.py
│   │   ├── listen_history.py
│   │   ├── playlist_save.py
│   │   ├── playlist.py
│   │   ├── song.py
│   │   ├── token.py
│   │   └── user.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── artists.py
│   │   ├── auth.py
│   │   ├── playlists.py
│   │   ├── songs.py
│   │   └── users.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── artist.py
│   │   ├── playlist.py
│   │   ├── song.py
│   │   └── user.py
│   ├── services/
│   │   └── email_service.py
│   ├── .env
│   ├── auth.py
│   ├── database.py
│   ├── dependencies.py
│   ├── main.py
│   └── requirements.txt
├── design/
│   └── figma-exports/
│       └── phase-2/
│           ├── auth/
│           │   ├── forgot-password.png
│           │   ├── login.png
│           │   ├── reset-password.png
│           │   └── signup.png
│           ├── home/
│           │   └── home-page.png
│           ├── playlist/
│           │   └── Playlist.png
│           └── profile/
│               ├── Artist Profile.png
│               └── User Profile.png
├── env/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── PlayerBar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TopNav.jsx
│   │   │   ├── ui/
│   │   │   │   ├── AnimatedEqualizer.jsx
│   │   │   │   ├── AuthCard.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── PasswordInput.jsx
│   │   │   │   └── PlayableThumbnail.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── ConfirmEmail.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── ArtistDashboard.jsx
│   │   │   ├── ArtistProfile.jsx
│   │   │   ├── Home.jsx
│   │   │   └── PlayerFull.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── playerStore.js
│   │   │   └── queueStore.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Backend

**Prerequisites**
- Python 3.10+
- PostgreSQL installed and running (or a hosted instance, e.g. Supabase)
- A Brevo account with a verified sending domain (for email features)

```bash
git clone https://github.com/PriyanshuM04/Rythem.git
cd Rythem/backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure your environment — create a .env file with:
#   DATABASE_URL
#   SECRET_KEY
#   BREVO_API_KEY
#   EMAIL_FROM_AUTH
#   EMAIL_FROM_SUPPORT
#   FRONTEND_URL

# Run the server
uvicorn main:app --reload
```

Interactive API docs are available at `http://127.0.0.1:8000/docs` once the server is running.

### Frontend

**Prerequisites**
- Node.js 18+

```bash
cd Rythem/frontend
npm install

# Copy the example env file and point it at your local backend
cp .env.example .env

npm run dev
```

The app runs at `http://localhost:5173`.

## Contributors

- **Priyanshu** — Project lead, backend & ML
- **Pranav Kumar Singh** — Frontend

## License

This project is currently private and under active development.