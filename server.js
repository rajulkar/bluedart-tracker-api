const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000; // ✅ Must use process.env.PORT for Render

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => res.send("Bluedart API is running"));

// Track AWB
app.post("/track", async (req, res) => {
  const { awb } = req.body;
  if (!awb) return res.status(400).json({ error: "Missing AWB" });

  try {
    const response = await fetch("https://www.bluedart.com/servlet/RoutingServlet", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `action=trackawb&awb=${awb}&scan=true&lang=english&track=Track`
    });

    const html = await response.text();
    const match = html.match(/<td class="[^"]*statusDateTime[^"]*">([\s\S]*?)<\/td>/);
    const status = match ? match[1].replace(/<[^>]*>/g, "").trim() : "Status not found";

    return res.json({ awb, status });

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Fetch failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

