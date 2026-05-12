const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const listingRoutes = require("./routes/listing.routes");
const app = express();
const exchangeRoutes = require("./routes/exchange.routes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("KelaniXchange API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/exchanges", exchangeRoutes);

module.exports = app;