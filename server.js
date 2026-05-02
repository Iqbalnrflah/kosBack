require("dotenv").config();

const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());

console.log("SERVER_KEY:", process.env.SERVER_KEY);

if (!process.env.SERVER_KEY) {
  console.log("❌ SERVER_KEY BELUM TERISI");
}

let snap = new midtransClient.Snap({
  isProduction: false, // tetap sandbox
  serverKey: process.env.SERVER_KEY,
});

app.post("/bayar", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { nama, amount } = req.body;

    console.log("TYPE AMOUNT:", typeof amount);
    console.log("VALUE AMOUNT:", amount);

    if (!nama || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        error: "nama & amount wajib dan amount harus > 0",
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

    console.log("URL MIDTRANS:", transaction.redirect_url);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server jalan di port", PORT)); 