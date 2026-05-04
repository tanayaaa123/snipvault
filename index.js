const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (acts like a database)
let snippets = [
  {
    id: uuidv4(),
    title: 'Fetch API Example',
    language: 'javascript',
    code: `const getData = async () => {\n  const res = await fetch('https://api.example.com/data');\n  const json = await res.json();\n  console.log(json);\n};`,
    tags: ['async', 'fetch', 'api'],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'useState Hook',
    language: 'jsx',
    code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`,
    tags: ['react', 'hooks', 'state'],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Express Route',
    language: 'javascript',
    code: `app.get('/users', async (req, res) => {\n  const users = await User.find();\n  res.json(users);\n});`,
    tags: ['node', 'express', 'route'],
    createdAt: new Date().toISOString(),
  },
];

// GET all snippets
app.get('/api/snippets', (req, res) => {
  const { search, language } = req.query;

  let result = [...snippets];

  // Filter by language if provided
  if (language && language !== 'all') {
    result = result.filter(s => s.language === language);
  }

  // Search by title or tags
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  res.json(result);
});

// GET single snippet by id
app.get('/api/snippets/:id', (req, res) => {
  const snippet = snippets.find(s => s.id === req.params.id);
  if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
  res.json(snippet);
});

// POST create new snippet
app.post('/api/snippets', (req, res) => {
  const { title, language, code, tags } = req.body;

  // Basic validation
  if (!title || !language || !code) {
    return res.status(400).json({ error: 'Title, language and code are required' });
  }

  const newSnippet = {
    id: uuidv4(),
    title,
    language,
    code,
    tags: tags || [],
    createdAt: new Date().toISOString(),
  };

  snippets.push(newSnippet);
  res.status(201).json(newSnippet);
});

// PUT update snippet
app.put('/api/snippets/:id', (req, res) => {
  const index = snippets.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Snippet not found' });

  // Merge old data with new data
  snippets[index] = { ...snippets[index], ...req.body };
  res.json(snippets[index]);
});

// DELETE snippet
app.delete('/api/snippets/:id', (req, res) => {
  const index = snippets.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Snippet not found' });

  snippets.splice(index, 1);
  res.json({ message: 'Snippet deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
