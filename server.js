const express = require("express");
const midtransClient = require("midtrans-client");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.get("/test", (req, res) => {
  res.send("Backend hidup");
});

let snap;

try {
  snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: "Mid-server-aH6j_Xq7s4fwsInRCOtsMiQV",
  });

  console.log("Midtrans connected");
} catch (err) {
  console.log("MIDTRANS ERROR:", err.message);
}

app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    const parameter = {
      transaction_details: {
        order_id: "INV-" + Date.now(),
        gross_amount: parseInt(amount),
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
    console.log("ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server jalan ${port}`);
});