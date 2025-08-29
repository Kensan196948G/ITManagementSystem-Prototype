const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const incidents = [
  { id: 1, title: "Server Down", status: "open" },
  { id: 2, title: "Email Failure", status: "investigating" }
];

app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

app.post("/api/incidents", (req, res) => {
  const newIncident = {
    id: Date.now(),
    ...req.body
  };
  incidents.push(newIncident);
  res.status(201).json(newIncident);
});

app.listen(PORT, () => {
  console.log(`✅ Backend API running at http://localhost:${PORT}`);
});
