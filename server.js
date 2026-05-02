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
    console.log("REQ BODY:", req.body);

    const { nama, amount } = req.body || {};

    if (!nama || !amount) {
      return res.status(400).json({
        error: "nama & amount wajib",
      });
    }

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({
        error: "SERVER_KEY belum ada di Railway ENV",
      });
    }

    const midtransClient = require("midtrans-client");

    let snap;
    try {
      snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_KEY,
      });
    } catch (e) {
      console.log("SNAP INIT ERROR:", e);
      return res.status(500).json({ error: "Midtrans init gagal" });
    }

    let transaction;

    try {
      transaction = await snap.createTransaction({
        transaction_details: {
          order_id: "ORDER-" + Date.now(),
          gross_amount: Number(amount),
        },
        customer_details: {
          first_name: nama,
        },
      });
    } catch (e) {
      console.log("MIDTRANS ERROR:", e);
      return res.status(500).json({
        error: "Midtrans gagal create transaction",
        detail: e.message,
      });
    }

    return res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log("FATAL ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

// ================= START (IMPORTANT) =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});