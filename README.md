# SnipVault — Code Snippet Manager

A full-stack web app built with **React + Node.js** to save and manage code snippets.

## Tech Stack

- **Frontend**: React (Vite), JSX, CSS-in-JS styles
- **Backend**: Node.js, Express, UUID
- **Storage**: In-memory (easy to swap with MongoDB or SQLite)

## Features

- Create, view, edit, delete code snippets
- Filter by programming language
- Search by title or tags
- Copy code to clipboard
- Clean dark terminal-inspired UI

---

## How to Run

### 1. Start the Backend (Node.js)

```bash
cd server
npm install
npm start
```

Server runs at: `http://localhost:5000`

### 2. Start the Frontend (React)

```bash
cd client
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/snippets         | Get all snippets         |
| GET    | /api/snippets/:id     | Get single snippet       |
| POST   | /api/snippets         | Create new snippet       |
| PUT    | /api/snippets/:id     | Update snippet           |
| DELETE | /api/snippets/:id     | Delete snippet           |

### Query Params for GET /api/snippets
- `?search=react` — search by title or tag
- `?language=javascript` — filter by language

---

## Project Structure

```
snippet-app/
├── server/
│   ├── index.js        # Express API server
│   └── package.json
├── client/
│   └── src/
│       └── App.jsx     # React frontend (full app)
└── README.md
```

---

## Resume Highlights (What this shows)

- RESTful API design with Express
- React hooks: useState, useEffect, useCallback
- CRUD operations end-to-end
- Clean component architecture
- Search & filter functionality
- Async/await and fetch API usage
