require("dotenv").config(); // 🔥 WAJIB

const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());

console.log("SERVER_KEY:", process.env.SERVER_KEY); // debug

let snap = new midtransClient.Snap({
  isProduction: false, // sandbox
  serverKey: process.env.SERVER_KEY, // ✅ FIX DI SINI
});

app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    if (!nama || !amount || amount <= 0) {
      return res.status(400).json({
        error: "Data tidak valid",
      });
    }

    let parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: nama,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    console.log("MIDTRANS URL:", transaction.redirect_url);

    res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log("ERROR MIDTRANS:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/webhook", (req, res) => {
  console.log("Webhook:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server jalan di port", PORT));