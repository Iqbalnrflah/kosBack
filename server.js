require("dotenv").config();

const express = require("express");
const midtransClient = require("midtrans-client");

const app = express();
app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({ status: "RUNNING" });
});

// ================= SNAP PAYMENT =================
app.post("/bayar", async (req, res) => {
  try {
    const { nama, amount } = req.body;

    if (!nama || !amount) {
      return res.status(400).json({ error: "nama & amount wajib" });
    }

    if (!process.env.SERVER_KEY) {
      return res.status(500).json({ error: "SERVER_KEY kosong" });
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

      // 🔥 IMPORTANT: redirect setelah bayar
      callbacks: {
        finish: "https://kosback-production.up.railway.app/finish",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return res.json({
      url: transaction.redirect_url,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

// ================= FINISH REDIRECT =================
app.get("/finish", (req, res) => {
  res.send(`
    <html>
      <head>
        <script>
          // balik ke aplikasi Flutter
          window.location.href = "myapp://success";
        </script>
      </head>
      <body>
        Pembayaran selesai...
      </body>
    </html>
  `);
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});