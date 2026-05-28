const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const listingRoutes = require("./routes/listing.routes");
const app = express();
const exchangeRoutes = require("./routes/exchange.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const chatRoutes = require("./routes/chat.routes");
const orderRoutes = require("./routes/orderRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const reviewRoutes = require("./routes/review.routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.send("KelaniXchange API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/reviews", reviewRoutes);

module.exports = app;
