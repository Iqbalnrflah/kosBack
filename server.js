require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({ status: "RUNNING" });
});

// ================= TEST ENV =================
app.get("/test", (req, res) => {
  res.json({
    env: process.env.SERVER_KEY ? "OK" : "MISSING",
  });
});

// ================= BAYAR (SAFE VERSION) =================
app.post("/bayar", async (req, res) => {
  try {
    const midtransClient = require("midtrans-client"); // pindah ke dalam route

    const { nama, amount } = req.body;

    if (!nama || !amount) {
      return res.status(400).json({ error: "nama & amount wajib" });
    }

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({ error: "SERVER_KEY kosong di Railway" });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.SERVER_KEY,
    });

    const result = await snap.createTransaction({
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: nama,
      },
    });

    return res.json({ url: result.redirect_url });

  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ================= START (IMPORTANT) =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});