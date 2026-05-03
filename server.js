require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({ status: "RUNNING" });
});

// ================= BAYAR SAFE =================
app.post("/bayar", async (req, res) => {
  try {
    console.log("REQUEST:", req.body);

    const { nama, amount } = req.body || {};

    if (!nama || !amount) {
      return res.status(400).json({
        error: "nama & amount wajib",
      });
    }

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({
        error: "SERVER_KEY belum di Railway ENV",
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
      console.log("SNAP ERROR:", e);
      return res.status(500).json({ error: "Midtrans init error" });
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
        error: "Midtrans gagal",
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

// ================= START (WAJIB STABIL DI RAILWAY) =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});