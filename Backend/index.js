const express = require("express");
const { PORT, mongoURL } = require("./config");
const mongoose = require("mongoose");
const { Item } = require("./models/itemmodel"); // <-- also make this CommonJS
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

// ================================== Multer =================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage });

// ============================== Routes =================================
app.get("/item", async (req, res) => {
  try {
    const items = await Item.find({});
    res.status(200).json({ count: items.length, data: items });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post("/item", upload.single("file"), async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.phoneno ||
      !req.body.title ||
      !req.body.description
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const newItem = {
      name: req.body.name,
      email: req.body.email,
      phoneno: req.body.phoneno,
      title: req.body.title,
      description: req.body.description,
      image: req.file?.filename || null,
    };

    const item = await Item.create(newItem);
    res.status(201).json(item);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/item/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send({ message: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete("/item/:id", async (req, res) => {
  try {
    const result = await Item.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send({ message: "Item not found" });
    res.status(200).send({ message: "Item deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});

// ============================== Start Server ==============================
mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("✅ Connected to database:");
    app.listen(PORT, () => console.log(`🚀 Server started at port ${PORT}`));
  })
  .catch((error) => console.log("❌ DB connection error:", error.message));
