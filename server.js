const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SERVER_KEY_KAMU",
});

app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    let parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
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
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server jalan di port 3000"));