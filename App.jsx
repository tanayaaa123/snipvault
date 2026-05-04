import { useState, useEffect, useCallback } from "react";

// Base URL for the backend API
const API_URL = "http://localhost:5000/api";

// Language color map for badges
const LANG_COLORS = {
  javascript: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  jsx: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  python: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  css: { bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6" },
  html: { bg: "#FFE4E6", text: "#9F1239", dot: "#F43F5E" },
  typescript: { bg: "#CFFAFE", text: "#155E75", dot: "#06B6D4" },
  default: { bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF" },
};

// Returns language badge styles
function getLangStyle(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

// All supported languages for the dropdown
const LANGUAGES = ["javascript", "jsx", "typescript", "python", "css", "html"];

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for create/edit
  const [form, setForm] = useState({
    title: "",
    language: "javascript",
    code: "",
    tags: "",
  });

  // Fetch snippets from backend
  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterLang !== "all") params.append("language", filterLang);

      const res = await fetch(`${API_URL}/snippets?${params}`);
      const data = await res.json();
      setSnippets(data);
    } catch (err) {
      console.error("Failed to fetch snippets:", err);
    }
    setLoading(false);
  }, [search, filterLang]);

  // Re-fetch whenever search or filter changes
  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Handle form input changes
  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Open form for creating a new snippet
  function openCreateForm() {
    setForm({ title: "", language: "javascript", code: "", tags: "" });
    setEditMode(false);
    setShowForm(true);
    setSelectedSnippet(null);
  }

  // Open form pre-filled with existing snippet data
  function openEditForm(snippet) {
    setForm({
      title: snippet.title,
      language: snippet.language,
      code: snippet.code,
      tags: snippet.tags.join(", "),
    });
    setEditMode(true);
    setShowForm(true);
  }

  // Create or update snippet
  async function handleSubmit(e) {
    e.preventDefault();

    // Convert comma-separated tags string into array
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editMode && selectedSnippet) {
        // Update existing snippet
        await fetch(`${API_URL}/snippets/${selectedSnippet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new snippet
        await fetch(`${API_URL}/snippets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setSelectedSnippet(null);
      fetchSnippets();
    } catch (err) {
      console.error("Failed to save snippet:", err);
    }
  }

  // Delete snippet by id
  async function handleDelete(id) {
    if (!window.confirm("Delete this snippet?")) return;
    try {
      await fetch(`${API_URL}/snippets/${id}`, { method: "DELETE" });
      if (selectedSnippet?.id === id) setSelectedSnippet(null);
      fetchSnippets();
    } catch (err) {
      console.error("Failed to delete snippet:", err);
    }
  }

  // Copy code to clipboard and show feedback
  function handleCopy(snippet) {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Format date to readable string
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div style={styles.root}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* App Header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>{"</>"}</span>
            <div>
              <div style={styles.logoTitle}>SnipVault</div>
              <div style={styles.logoSub}>Code Snippet Manager</div>
            </div>
          </div>

          {/* New Snippet Button */}
          <button style={styles.newBtn} onClick={openCreateForm}>
            + New Snippet
          </button>

          {/* Search Input */}
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search snippets or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Language Filter */}
          <select
            style={styles.select}
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
          >
            <option value="all">All Languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Snippet List */}
        <div style={styles.snippetList}>
          {loading && (
            <div style={styles.emptyMsg}>Loading snippets...</div>
          )}
          {!loading && snippets.length === 0 && (
            <div style={styles.emptyMsg}>No snippets found.</div>
          )}
          {snippets.map((snippet) => {
            const langStyle = getLangStyle(snippet.language);
            const isActive = selectedSnippet?.id === snippet.id;

            return (
              <div
                key={snippet.id}
                style={{
                  ...styles.snippetCard,
                  background: isActive ? "#1E293B" : "#0F172A",
                  borderColor: isActive ? "#6366F1" : "#1E293B",
                }}
                onClick={() => {
                  setSelectedSnippet(snippet);
                  setShowForm(false);
                }}
              >
                {/* Language dot + name */}
                <div style={styles.snippetCardTop}>
                  <span
                    style={{
                      ...styles.langDot,
                      background: langStyle.dot,
                    }}
                  />
                  <span style={styles.snippetLang}>{snippet.language}</span>
                </div>

                {/* Title */}
                <div style={styles.snippetTitle}>{snippet.title}</div>

                {/* Tags */}
                <div style={styles.tagRow}>
                  {snippet.tags.slice(0, 3).map((tag) => (
                    <span key={tag} style={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Date */}
                <div style={styles.snippetDate}>{formatDate(snippet.createdAt)}</div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main style={styles.main}>
        {/* Create / Edit Form */}
        {showForm && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>
              {editMode ? "Edit Snippet" : "New Snippet"}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Title */}
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Debounce Hook"
                required
              />

              {/* Language */}
              <label style={styles.label}>Language</label>
              <select
                style={styles.input}
                name="language"
                value={form.language}
                onChange={handleFormChange}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              {/* Tags */}
              <label style={styles.label}>Tags (comma separated)</label>
              <input
                style={styles.input}
                name="tags"
                value={form.tags}
                onChange={handleFormChange}
                placeholder="e.g. react, hooks, state"
              />

              {/* Code */}
              <label style={styles.label}>Code</label>
              <textarea
                style={styles.textarea}
                name="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="Paste your code here..."
                required
                rows={12}
              />

              {/* Buttons */}
              <div style={styles.formBtns}>
                <button type="submit" style={styles.saveBtn}>
                  {editMode ? "Update" : "Save Snippet"}
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Snippet Detail View */}
        {!showForm && selectedSnippet && (
          <div style={styles.detailContainer}>
            {/* Header */}
            <div style={styles.detailHeader}>
              <div>
                <h1 style={styles.detailTitle}>{selectedSnippet.title}</h1>
                <div style={styles.detailMeta}>
                  {/* Language badge */}
                  <span
                    style={{
                      ...styles.langBadge,
                      background: getLangStyle(selectedSnippet.language).bg,
                      color: getLangStyle(selectedSnippet.language).text,
                    }}
                  >
                    {selectedSnippet.language}
                  </span>

                  {/* Date */}
                  <span style={styles.detailDate}>
                    {formatDate(selectedSnippet.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.detailActions}>
                <button
                  style={styles.copyBtn}
                  onClick={() => handleCopy(selectedSnippet)}
                >
                  {copiedId === selectedSnippet.id ? "✓ Copied!" : "Copy Code"}
                </button>
                <button
                  style={styles.editBtn}
                  onClick={() => openEditForm(selectedSnippet)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(selectedSnippet.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Tags */}
            {selectedSnippet.tags.length > 0 && (
              <div style={styles.tagRow}>
                {selectedSnippet.tags.map((tag) => (
                  <span key={tag} style={styles.tagDetail}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Code Block */}
            <pre style={styles.codeBlock}>
              <code style={styles.codeText}>{selectedSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Empty State - nothing selected */}
        {!showForm && !selectedSnippet && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>{"</>"}</div>
            <h2 style={styles.emptyTitle}>SnipVault</h2>
            <p style={styles.emptyText}>
              Select a snippet to view it, or create a new one.
            </p>
            <button style={styles.saveBtn} onClick={openCreateForm}>
              + Create your first snippet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── All styles in one object ──
const styles = {
  root: {
    display: "flex",
    height: "100vh",
    background: "#020617",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: "#E2E8F0",
    overflow: "hidden",
  },

  // Sidebar
  sidebar: {
    width: "300px",
    minWidth: "300px",
    background: "#0F172A",
    borderRight: "1px solid #1E293B",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "20px 16px 12px",
    borderBottom: "1px solid #1E293B",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  logoIcon: {
    fontSize: "22px",
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "700",
  },
  logoTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F1F5F9",
    letterSpacing: "-0.3px",
  },
  logoSub: {
    fontSize: "11px",
    color: "#64748B",
  },
  newBtn: {
    background: "#6366F1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "inherit",
    transition: "background 0.2s",
  },
  searchInput: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#E2E8F0",
    padding: "8px 12px",
    fontSize: "12px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#94A3B8",
    padding: "8px 12px",
    fontSize: "12px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },

  // Snippet list
  snippetList: {
    overflowY: "auto",
    flex: 1,
    padding: "8px",
  },
  snippetCard: {
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "6px",
    cursor: "pointer",
    border: "1px solid",
    transition: "all 0.15s",
  },
  snippetCardTop: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  },
  langDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  snippetLang: {
    fontSize: "11px",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  snippetTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F1F5F9",
    marginBottom: "6px",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "6px",
  },
  tag: {
    fontSize: "10px",
    color: "#6366F1",
    background: "#1E1B4B",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  snippetDate: {
    fontSize: "10px",
    color: "#475569",
  },
  emptyMsg: {
    color: "#475569",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "32px",
  },

  // Main panel
  main: {
    flex: 1,
    overflow: "auto",
    background: "#020617",
  },

  // Create/Edit form
  formContainer: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    color: "#64748B",
    marginBottom: "4px",
    marginTop: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    color: "#E2E8F0",
    padding: "10px 14px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
  },
  textarea: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    color: "#E2E8F0",
    padding: "12px 14px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    lineHeight: "1.6",
  },
  formBtns: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  saveBtn: {
    background: "#6366F1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "inherit",
  },
  cancelBtn: {
    background: "transparent",
    color: "#94A3B8",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },

  // Snippet detail
  detailContainer: {
    padding: "32px 36px",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  detailTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#F1F5F9",
    margin: "0 0 8px 0",
  },
  detailMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  langBadge: {
    padding: "3px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  detailDate: {
    fontSize: "12px",
    color: "#475569",
  },
  detailActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  copyBtn: {
    background: "#1E293B",
    color: "#A5B4FC",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
    fontWeight: "600",
  },
  editBtn: {
    background: "transparent",
    color: "#94A3B8",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  deleteBtn: {
    background: "transparent",
    color: "#F87171",
    border: "1px solid #1E293B",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  },
  tagDetail: {
    fontSize: "12px",
    color: "#818CF8",
    background: "#1E1B4B",
    padding: "3px 8px",
    borderRadius: "5px",
  },
  codeBlock: {
    background: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "20px",
    overflowX: "auto",
    lineHeight: "1.7",
  },
  codeText: {
    fontSize: "13px",
    color: "#94A3B8",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "12px",
    padding: "40px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "48px",
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#F1F5F9",
    margin: 0,
  },
  emptyText: {
    color: "#475569",
    fontSize: "14px",
    margin: 0,
  },
};
