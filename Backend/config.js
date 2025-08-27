require("dotenv").config({ path: ".env.local" });

const PORT = process.env.PORT || 8000;
const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/lost-and-found";

module.exports = { PORT, mongoURL };
