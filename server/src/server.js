const dns = require("dns");

// Force ALL DNS resolution (SRV, TXT, A records) through Google DNS
// This is needed because the MongoDB driver uses dns.resolveSrv() and dns.resolveTxt()
dns.setServers(["8.8.8.8", "8.8.4.4"]);


require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
