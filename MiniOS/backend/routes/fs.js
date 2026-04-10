const express = require("express");
const fsCore = require("../core/filesystem/fs");

const router = express.Router();

// ================= LIST =================
router.get("/ls", (req, res) => {
  try {
    const files = fsCore.listDir(req.query.path || "/");
    res.json(files);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ================= READ =================
router.get("/cat", (req, res) => {
  try {
    const content = fsCore.readFile(req.query.path);
    res.send(content);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ================= CREATE DIR =================
router.post("/mkdir", (req, res) => {
  try {
    const { path, name } = req.body;

    fsCore.mkdir(path, name);

    res.send("Directory created");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ================= CREATE FILE =================
router.post("/touch", (req, res) => {
  try {
    const { path, name, content } = req.body;

    fsCore.createFile(path, name, content || "");

    res.send("File created");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ================= WRITE =================
router.post("/write", (req, res) => {
  try {
    const { path, content } = req.body;

    fsCore.writeFile(path, content);

    res.send("File updated");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ================= DELETE =================
router.post("/rm", (req, res) => {
  try {
    const { path } = req.body;

    fsCore.deleteFile(path);

    res.send("Deleted");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;