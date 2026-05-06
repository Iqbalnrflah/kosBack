const express = require("express");
const midtransClient = require("midtrans-client");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const snap = new midtransClient.Snap({
  isProduction: false, // sandbox dulu
  serverKey: "Mid-server-aH6j_Xq7s4fwsInRCOtsMiQV",
});

app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    const parameter = {
      transaction_details: {
        order_id: "INV-" + Date.now(),
        gross_amount: amount,
      },
      customer_details: {
        first_name: nama,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server jalan di http://192.168.1.10:3000");
});