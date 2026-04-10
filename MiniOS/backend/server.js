const express = require("express");
const cors = require("cors");

const app = express();
const terminalRoutes = require("./routes/terminal.js");


app.use(cors());
app.use(express.json());
app.use("/terminal", terminalRoutes);
// test route
app.get("/", (req, res) => {
  res.send("MiniOS backend running 🚀");
});

const fsRoutes = require("./routes/fs");

app.use("/fs", fsRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});