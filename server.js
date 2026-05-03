require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// DEBUG ENV
console.log("SERVER_KEY:", process.env.SERVER_KEY ? "OK" : "MISSING");

// ROOT
app.get("/", (req, res) => {
  res.json({ status: "RUNNING" });
});

// BAYAR
app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body || {};

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({
        error: "SERVER_KEY belum ada (cek Railway ENV atau .env lokal)",
      });
    }

    const midtransClient = require("midtrans-client");

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.SERVER_KEY,
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: nama,
      },
    });

    return res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON PORT", PORT);
});