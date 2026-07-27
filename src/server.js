import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.get("/api/serp", async (req, res) => {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", req.query.engine);
  url.searchParams.set("q", req.query.q);
  url.searchParams.set("api_key", process.env.SERPAPI_KEY);

  if (req.query.continuable) {
    url.searchParams.set("continuable", req.query.continuable);
  }
  if (req.query.subsequent_request_token) {
    url.searchParams.set("subsequent_request_token", req.query.subsequent_request_token);
  }

  try {
    const resp = await fetch(url.toString());
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log("SERPAPI_KEY loaded:", Boolean(process.env.SERPAPI_KEY));
});