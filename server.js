// Track single AWB
app.post("/track", async (req, res) => {
  const { awb } = req.body;
  if (!awb) return res.status(400).json({ error: "Missing AWB" });

  try {
    const response = await fetch("https://www.bluedart.com/servlet/RoutingServlet", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `action=trackawb&awb=${awb}&scan=true&lang=english&track=Track`
    });

    const html = await response.text();

    // Extract all <td> blocks
    const tdMatches = [...html.matchAll(/<td[^>]*>(.*?)<\/td>/g)];

    // Try to find the status from common phrases
    const statusTd = tdMatches.find(match =>
      /delivered|shipment arrived|out for delivery|in transit|consignment/i.test(match[1].toLowerCase())
    );

    const status = statusTd ? statusTd[1].replace(/<[^>]+>/g, "").trim() : "Status not found";

    return res.json({ awb, status });

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Fetch failed" });
  }
});
