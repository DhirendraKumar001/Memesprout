# MemeSprout

A full-stack social platform — MongoDB, Express, React, Node (MERN) — with a light,
Instagram-inspired UI: a sticky icon sidebar, a horizontally-scrolling "stories" row of
members, image posts with heart/comment actions, and a suggestions rail. Colors are soft and
easy on the eyes (off-white background, calm blue accent, no harsh pure black or white)
instead of a heavy dark theme.

## Features

- **Feed & posts** — create posts (with optional image URL), like, comment
- **Repost** — reshare a post to your own feed; reposting a repost resolves to the
  original so chains can't form; toggle to undo
- **Save posts** — bookmark any post, view them all on the Saved page
- **Follow / profiles** — follow other members, view their posts and stats
- **Avatars** — upload a profile photo (stored as a data URI, 3MB cap) from the
  Edit Profile screen; anyone without one gets a colorful monogram instead
- **Private accounts** — toggle your account private in Settings; only your followers
  (and you) can see your posts once it's on
- **Direct messages** — a conversation list + thread view, with light polling so new
  messages show up without a manual refresh, plus an unread badge in the nav
- **Dark / light / system theme** — instant theme switching via CSS variables, no
  flash-of-wrong-theme on load, persisted in local storage
- **Settings page** — theme, privacy toggle, account info, log out

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Framer Motion, lucide-react

## Project structure

```
memesprout/
  backend/
    config/db.js            MongoDB connection
    models/                 User, Post (with embedded comments)
    controllers/             auth, user, post logic
    routes/                  /api/auth, /api/users, /api/posts
    middleware/              JWT auth guard, centralized error handler
    server.js                Express app entry
  frontend/
    src/
      api/axios.js            Axios instance with JWT interceptor
      context/AuthContext.jsx Global auth/session state
      components/              Navbar, Seal (signature avatar), PostCard, CreatePost,
                                CommentSection, UserCard, Loader, ProtectedRoute
      pages/                    Feed, Explore, Profile, Login, Register, NotFound
```

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev               # starts on http://localhost:5000
```

You'll need a MongoDB instance running — either locally (`mongodb://127.0.0.1:27017/memesprout`)
or a free MongoDB Atlas cluster (paste its connection string into `MONGO_URI`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` by default. To point it elsewhere,
create `frontend/.env` with:

```
VITE_API_URL=https://your-api-url.com/api
```

## API overview

| Method | Route                       | Auth | Description                          |
|--------|------------------------------|------|---------------------------------------|
| POST   | /api/auth/register            | –    | Create a member account               |
| POST   | /api/auth/login                | –    | Log in, returns JWT                  |
| GET    | /api/auth/me                    | ✓    | Get current member                    |
| GET    | /api/users?q=                   | –    | Search members                       |
| GET    | /api/users/:handle              | –*   | Public profile + their posts (privacy-gated) |
| GET    | /api/users/me/saved              | ✓    | Your saved (bookmarked) posts        |
| PUT    | /api/users/me                    | ✓    | Update name/bio/craft/privacy/theme  |
| POST   | /api/users/:handle/follow         | ✓    | Toggle follow                        |
| GET    | /api/posts?page=&limit=           | –*   | Paginated feed, newest first (private accounts hidden from non-followers) |
| POST   | /api/posts                        | ✓    | Create a post                        |
| DELETE | /api/posts/:id                    | ✓    | Delete own post (or repost)          |
| POST   | /api/posts/:id/like                | ✓    | Toggle like                          |
| POST   | /api/posts/:id/save                | ✓    | Toggle save/bookmark                 |
| POST   | /api/posts/:id/repost               | ✓    | Toggle repost                        |
| POST   | /api/posts/:id/comments             | ✓    | Comment on a post                    |
| GET    | /api/messages/conversations         | ✓    | List conversations (last message, unread count) |
| GET    | /api/messages/unread-count           | ✓    | Total unread message count           |
| GET    | /api/messages/:handle                | ✓    | Thread with a member (marks read)    |
| POST   | /api/messages/:handle                | ✓    | Send a message                       |

\* These routes accept an optional token — logged-in viewers get privacy-aware
results (private-account filtering, saved/reposted state); anonymous viewers get
the public-safe subset.

## Design notes

The signature element is the **wax seal**: every member gets a procedurally-colored circular
monogram (their initials, embossed) instead of an uploaded photo, echoing a private club's
membership card rather than a typical social app. Posts are called "entries," likes are
"toasts," and each entry is timestamped against night hours ("the small hours," "after hours")
to keep the whole product grounded in its premise instead of being a generic dark-mode template.

Palette: near-black ink background (`#0B0C0E`), warm brass gold (`#C9A227` / `#E8C468`),
aged ivory text (`#EDE6D6`), with a muted wine red reserved only for destructive actions.
Typography pairs Fraunces (a warm display serif) for names and headings with Inter for body
text and IBM Plex Mono for small uppercase labels — the "eyebrow" tags that mark each entry's
time of night.
