const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 10000; // Render uses dynamic ports

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => res.send("Bluedart API is running"));

// Track single AWB
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

    // Extract all <td> elements
    const tdMatches = [...html.matchAll(/<td[^>]*>(.*?)<\/td>/g)];
    
    // Find first <td> that contains typical status phrases
    const statusTd = tdMatches.find(match =>
      /delivered|shipment arrived|out for delivery|in transit/i.test(match[1])
    );

    const status = statusTd ? statusTd[1].replace(/<[^>]+>/g, "").trim() : "Status not found";
    return res.json({ awb, status });

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Fetch failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
