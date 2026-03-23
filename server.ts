import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("govconnect.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    type TEXT,
    urgency INTEGER,
    impact_score TEXT,
    status TEXT,
    description TEXT,
    location_name TEXT,
    lat REAL,
    lng REAL,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    evidence_url TEXT,
    upvotes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id TEXT,
    event_type TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const issueCount = db.prepare("SELECT COUNT(*) as count FROM issues").get() as { count: number };
if (issueCount.count === 0) {
  const insertIssue = db.prepare(`
    INSERT INTO issues (id, type, urgency, impact_score, status, description, location_name, lat, lng, upvotes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIssue.run("#8842", "Infrastructure", 98, "CRITICAL", "PENDING", "Severe water main leakage reported at 4th and Main St. Compromising road structural integrity. Potential outage for 500+ households.", "Downtown District, near Metro Station", 37.7749, -122.4194, 12);
  insertIssue.run("#8839", "Public Safety", 82, "HIGH", "DISPATCHED", "Street light outage in North Park area. Multiple reports of reduced visibility and safety concerns.", "Residential Zone, 5th Ave & Pine", 37.7833, -122.4167, 5);
  insertIssue.run("#8831", "Sanitation", 45, "MEDIUM", "VERIFIED", "Major pipe burst causing flooding in Riverside area.", "Riverside Terrace, Block B", 37.7900, -122.4000, 21);

  const insertTimeline = db.prepare(`
    INSERT INTO timeline (issue_id, event_type, message, timestamp)
    VALUES (?, ?, ?, ?)
  `);
  
  insertTimeline.run("#8831", "status_update", "Verified by Inspector 12. 'Waste clearance complete.'", new Date(Date.now() - 15 * 60000).toISOString());
  insertTimeline.run("#8839", "dispatch", "Team Alpha Dispatched. En route to Public Safety concern #8839.", new Date(Date.now() - 42 * 60000).toISOString());
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/issues", (req, res) => {
    const issues = db.prepare("SELECT * FROM issues ORDER BY reported_at DESC").all();
    res.json(issues);
  });

  app.get("/api/issues/:id", (req, res) => {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    res.json(issue);
  });

  app.post("/api/issues", (req, res) => {
    const { type, description, lat, lng, location_name } = req.body;
    const id = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const urgency = Math.floor(Math.random() * 100);
    const impact_score = urgency > 80 ? "CRITICAL" : urgency > 50 ? "HIGH" : "MEDIUM";
    
    db.prepare(`
      INSERT INTO issues (id, type, urgency, impact_score, status, description, location_name, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, type || "General", urgency, impact_score, "PENDING", description, location_name || "Unknown Location", lat || 0, lng || 0);

    res.json({ id, status: "success" });
  });

  app.post("/api/issues/:id/upvote", (req, res) => {
    db.prepare("UPDATE issues SET upvotes = upvotes + 1 WHERE id = ?").run(req.params.id);
    res.json({ status: "success" });
  });

  app.get("/api/timeline", (req, res) => {
    const timeline = db.prepare("SELECT * FROM timeline ORDER BY timestamp DESC LIMIT 10").all();
    res.json(timeline);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
