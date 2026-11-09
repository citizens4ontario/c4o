CREATE TABLE intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    involvement TEXT NOT NULL, -- JSON array of selected pathways
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
