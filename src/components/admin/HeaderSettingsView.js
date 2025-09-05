import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ENV_HEADER =
  (typeof process !== "undefined" &&
    (process.env.REACT_APP_STUDENT_LOGIN_HEADER ||
      process.env.NEXT_PUBLIC_STUDENT_LOGIN_HEADER)) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_STUDENT_LOGIN_HEADER) ||
  "🎓 Student Login";

const KEY = "studentLogin.headerText";

export default function HeaderSettingsView() {
  const navigate = useNavigate();

  const readHeader = () => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved && saved.trim() ? saved : ENV_HEADER;
    } catch {
      return ENV_HEADER;
    }
  };

  const [draft, setDraft] = useState(readHeader());
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
  }, [draft]);

  const save = () => {
    const next = (draft || "").trim() || ENV_HEADER;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    setDraft(next);
    setMessage("Saved ✔");
    // optional: navigate(-1); // go back after save
  };

  const reset = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setDraft(ENV_HEADER);
    setMessage("Reset to default");
  };

  const cancel = () => navigate(-1);

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Portal Settings</h1>

      <div className="mb-3">
        <label className="form-label">Portal Header Title</label>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 520 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            maxLength={80}
            placeholder="Enter header text"
            autoFocus
          />
          <button type="button" className="btn-save" onClick={save}>
            Save
          </button>
          <button type="button" className="btn-secondary" onClick={cancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-link p-0 ms-2"
            onClick={reset}
            title="Reset to default"
          >
            Reset to default
          </button>
        </div>
        {message && <div className="small text-muted mt-2">{message}</div>}
      </div>

      <div className="mt-4">
        <div className="text-muted">Preview</div>
        <h2 className="mt-2">{draft}</h2>
      </div>
    </div>
  );
}
