# Rythem 🎵

A music streaming web app built for people who want a clean, simple way to discover and organize music.

## About

Rythem lets users explore songs, build their own playlists, and enjoy a smooth listening experience — all from the browser, no installs required. The project is being built in phases, with new features rolling out progressively.

## Features

### Available Now
- **Secure Authentication** — Create an account and log in safely, with industry-standard password protection.
- **Song Library** — Browse and explore songs available on the platform.
- **Playlists** — Create personal playlists and organize your favorite tracks.
- **User Profiles** — View your account details and your saved playlists in one place.

### Coming Soon
- A richer listening experience with more personalization
- Expanded music catalog from a growing number of artists
- New ways to support the platform and unlock additional features

## Tech Stack

**Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy (ORM)
- JWT-based authentication

**Frontend** *(in progress)*
- React + Vite

## Project Structure

```
rythem/
└── backend/
    ├── main.py
    ├── database.py
    ├── auth.py
    ├── models/
    ├── schemas/
    └── routes/
```

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL installed and running

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd rythem/backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure your environment
# Create a .env file with your database credentials

# Run the server
uvicorn main:app --reload
```

### API Documentation

Once the server is running, visit:
```
http://127.0.0.1:8000/docs
```
for interactive, auto-generated API documentation.

## Author

Built by Priyanshu.

## License

This project is currently private and under active development.
