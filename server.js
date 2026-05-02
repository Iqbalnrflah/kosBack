require("dotenv").config();

const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());

// ================= DEBUG START =================
console.log("🚀 SERVER STARTING...");
console.log("🔑 SERVER_KEY EXISTS:", !!process.env.SERVER_KEY);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    status: "RUNNING",
    server: "OK",
    env: process.env.SERVER_KEY ? "LOADED" : "MISSING",
  });
});

// ================= TEST =================
app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    key: process.env.SERVER_KEY
      ? process.env.SERVER_KEY.slice(0, 10)
      : null,
  });
});

// ================= BAYAR =================
app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    console.log("📩 REQUEST:", req.body);

    // VALIDASI ENV
    if (!process.env.SERVER_KEY) {
      return res.status(500).json({
        error: "SERVER_KEY tidak ditemukan di Railway ENV",
      });
    }

    // VALIDASI INPUT
    if (!nama || !amount) {
      return res.status(400).json({
        error: "nama & amount wajib",
      });
    }

    // SNAP INSTANCE (AMAN DI DALAM ROUTE)
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: nama,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    console.log("✅ MIDTRANS URL:", transaction.redirect_url);

    return res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log("❌ MIDTRANS ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

// ================= START SERVER (RAILWAY FIX) =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 Server jalan di port", PORT);
});