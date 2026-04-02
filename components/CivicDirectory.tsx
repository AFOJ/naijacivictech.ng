"use client";

import { useCallback, useMemo, useState } from "react";
import {
  INITIAL_TOOLS,
  type Tool,
  type ToolStatus,
} from "@/data/tools";
import { GitHubIcon } from "@/components/GitHubIcon";

const CATEGORIES = [
  "all",
  "Democracy",
  "Health",
  "Infrastructure",
  "Transparency",
  "Economy",
  "Education",
] as const;

const MARQUEE_ITEMS = [
  "eVoting",
  "Politician Tracker",
  "Drug Verification",
  "Budget Watch",
  "Scholarship Finder",
  "Power Outage Map",
  "Contract Transparency",
  "Rep Accountability",
  "Road Reports",
  "FarmPrices",
];

const ICON_POOL = ["🔧", "💡", "🛠️", "⚙️", "🚀"];
const COLOR_POOL = ["#1A6B3C", "#C4410C", "#185FA5", "#7C3AB7", "#854F0B"];

function statusClass(s: ToolStatus) {
  if (s === "Idea") return "badge-idea";
  if (s === "Prototype") return "badge-prototype";
  return "badge-live";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function cloneTools(list: Tool[]): Tool[] {
  return list.map((t) => ({ ...t }));
}

export function CivicDirectory() {
  const [tools, setTools] = useState<Tool[]>(() => cloneTools(INITIAL_TOOLS));
  const [currentCat, setCurrentCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState("");
  const [fStatus, setFStatus] = useState<ToolStatus | "">("");
  const [fGithub, setFGithub] = useState("");
  const [fLive, setFLive] = useState("");
  const [fAuthor, setFAuthor] = useState("");

  const filtered = useMemo(() => {
    let list = tools;
    if (currentCat !== "all") {
      list = list.filter((t) => t.category === currentCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [tools, currentCat, searchQuery]);

  const openModal = useCallback(() => {
    setModalOpen(true);
    setSubmitSuccess(false);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSubmitSuccess(false);
  }, []);

  const resetForm = useCallback(() => {
    setFName("");
    setFDesc("");
    setFCat("");
    setFStatus("");
    setFGithub("");
    setFLive("");
    setFAuthor("");
  }, []);

  const toggleVote = useCallback((id: number) => {
    setVotedIds((prevVoted) => {
      const was = prevVoted.has(id);
      const next = new Set(prevVoted);
      if (was) next.delete(id);
      else next.add(id);
      setTools((prevTools) =>
        prevTools.map((t) =>
          t.id === id ? { ...t, votes: t.votes + (was ? -1 : 1) } : t,
        ),
      );
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const name = fName.trim();
    const desc = fDesc.trim();
    const cat = fCat.trim();
    const status = fStatus;
    const author = fAuthor.trim() || "Anonymous";

    if (!name || !desc || !cat || !status) {
      window.alert("Please fill in the required fields.");
      return;
    }

    const newTool: Tool = {
      id: Date.now(),
      icon: ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)]!,
      name,
      desc,
      category: cat,
      status: status as ToolStatus,
      author,
      authorColor: COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)]!,
      github: fGithub.trim() || "https://github.com",
      live: fLive.trim() || null,
      votes: 0,
    };

    setTools((prev) => [newTool, ...prev]);
    setSubmitSuccess(true);
    resetForm();

    window.setTimeout(() => {
      setModalOpen(false);
      setSubmitSuccess(false);
    }, 3500);
  }, [fName, fDesc, fCat, fStatus, fAuthor, fGithub, fLive, resetForm]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <>
      <header>
        <div className="logo">
          <span className="logo-dot" />
          NaijaCivicTech
        </div>
        <nav>
          <a href="#tools">Directory</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <button type="button" className="nav-cta" onClick={openModal}>
            Submit a Tool
          </button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-eyebrow">Nigerian Developer Movement</div>
        <h1>
          Build the tools <br />
          <em>Nigeria</em> <span className="accent-line">deserves</span>
        </h1>
        <p className="hero-sub">
          A community directory of open-source tools, prototypes, and platforms
          built by Nigerian developers to solve Nigerian problems.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">{tools.length}</span>
            <span className="stat-label">Tools Listed</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">6</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">40+</span>
            <span className="stat-label">Contributors</span>
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={openModal}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Submit a Tool
          </button>
          <a href="#tools" className="btn-secondary">
            Browse Directory →
          </a>
        </div>
      </section>

      <div className="marquee-band">
        <div className="marquee-inner">
          {Array.from({ length: 4 }).map((_, copy) => (
            <span key={copy}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={`${copy}-${item}`}>
                  <span>{item}</span>
                  <span className="dot">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="filters-section" id="tools">
        <div className="filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-tab${currentCat === cat ? " active" : ""}`}
              data-cat={cat}
              onClick={() => setCurrentCat(cat)}
            >
              {cat === "all" ? "All Tools" : cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5" stroke="#7A7468" strokeWidth="1.5" />
            <path
              d="M11 11l3 3"
              stroke="#7A7468"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search tools…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tools"
          />
        </div>
      </section>

      <section className="tools-section">
        <div className="section-meta">
          Showing {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
        </div>
        <div className="tools-grid">
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--muted)",
                gridColumn: "1 / -1",
                fontSize: 14,
              }}
            >
              No tools found.{" "}
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--accent)",
                  cursor: "pointer",
                  font: "inherit",
                  textDecoration: "underline",
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="tool-card">
                <div className="tool-card-top">
                  <div className="tool-icon">{t.icon}</div>
                  <div className="tool-badges">
                    <span className="badge badge-cat">{t.category}</span>
                    <span className={`badge ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
                <div className="tool-title">{t.name}</div>
                <div className="tool-desc">{t.desc}</div>
                <div className="tool-footer">
                  <div className="tool-author">
                    <div
                      className="avatar"
                      style={{ background: t.authorColor }}
                    >
                      {initials(t.author)}
                    </div>
                    {t.author}
                  </div>
                  <div className="tool-links">
                    <a
                      href={t.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tool-link"
                      title="GitHub"
                    >
                      <GitHubIcon /> GitHub
                    </a>
                    {t.live ? (
                      <a
                        href={t.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tool-link"
                        title="Live site"
                      >
                        ↗ Live
                      </a>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={`tool-votes${votedIds.has(t.id) ? " voted" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVote(t.id);
                    }}
                  >
                    ▲ <span>{t.votes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="submit-banner">
        <div className="submit-inner">
          <div className="submit-text">
            <h2>Built something for Nigeria?</h2>
            <p>
              Add your tool, prototype, or idea to the directory. It doesn&apos;t
              have to be finished — ideas count too.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={openModal}
            style={{
              whiteSpace: "nowrap",
              background: "var(--gold)",
              color: "var(--ink)",
            }}
          >
            Submit Your Tool →
          </button>
        </div>
      </section>

      <footer>
        <div className="foot-logo">NaijaCivicTech</div>
        <p>Open source. Built by Nigerians, for Nigeria.</p>
        <div className="foot-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="#">Twitter / X</a>
          <a href="#">WhatsApp Community</a>
        </div>
      </footer>

      <div
        className={`modal-overlay${modalOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeModal();
        }}
      >
        <div className="modal">
          <button
            type="button"
            className="modal-close"
            onClick={closeModal}
            aria-label="Close"
          >
            ✕
          </button>
          {!submitSuccess ? (
            <div id="formContent">
              <div className="modal-eyebrow">Submit a Tool</div>
              <h2 id="submit-modal-title">Add to the Directory</h2>
              <p className="desc">
                Prototypes, ideas, and live tools all welcome. The only rule: it
                must try to solve a Nigerian problem.
              </p>
              <div className="field-group">
                <label htmlFor="f-name">Tool Name</label>
                <input
                  id="f-name"
                  type="text"
                  placeholder="e.g. eVote Nigeria"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="f-desc">Short Description</label>
                <textarea
                  id="f-desc"
                  placeholder="What does it do? Who is it for?"
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="f-cat">Category</label>
                  <select
                    id="f-cat"
                    value={fCat}
                    onChange={(e) => setFCat(e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="Democracy">Democracy</option>
                    <option value="Health">Health</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Transparency">Transparency</option>
                    <option value="Economy">Economy</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="f-status">Status</label>
                  <select
                    id="f-status"
                    value={fStatus}
                    onChange={(e) =>
                      setFStatus(e.target.value as ToolStatus | "")
                    }
                  >
                    <option value="">Select status</option>
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="f-github">GitHub URL</label>
                  <input
                    id="f-github"
                    type="url"
                    placeholder="https://github.com/…"
                    value={fGithub}
                    onChange={(e) => setFGithub(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="f-live">Live URL (optional)</label>
                  <input
                    id="f-live"
                    type="url"
                    placeholder="https://…"
                    value={fLive}
                    onChange={(e) => setFLive(e.target.value)}
                  />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="f-author">Your Name / Handle</label>
                <input
                  id="f-author"
                  type="text"
                  placeholder="@yourhandle"
                  value={fAuthor}
                  onChange={(e) => setFAuthor(e.target.value)}
                />
              </div>
              <button type="button" className="modal-submit" onClick={handleSubmit}>
                Add to Directory →
              </button>
            </div>
          ) : (
            <div className="success-msg open">
              <div className="check" aria-hidden>
                🇳🇬
              </div>
              <h3>Submitted! Omo, e dey work.</h3>
              <p>
                Your tool will be reviewed and added to the directory shortly.
                Thank you for building for Nigeria.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
