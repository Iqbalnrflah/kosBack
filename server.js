require("dotenv").config();

const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());
console.log("SERVER STARTING...");
console.log("SERVER_KEY EXISTS:", !!process.env.SERVER_KEY);
console.log("FORCE REDEPLOY", Date.now());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({
    status: "RUNNING",
    env: process.env.SERVER_KEY ? "OK" : "MISSING",
  });
});

app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    key: process.env.SERVER_KEY?.slice(0, 10) || null,
  });
});

// ================= BAYAR =================
app.post("/bayar", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { nama, amount } = req.body;

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({
        error: "SERVER_KEY tidak ditemukan di ENV",
      });
    }

    if (!nama || !amount) {
      return res.status(400).json({
        error: "nama & amount wajib",
      });
    }

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

    console.log("MIDTRANS SUCCESS URL:", transaction.redirect_url);

    return res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log("MIDTRANS ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});