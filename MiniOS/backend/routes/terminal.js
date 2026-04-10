const express = require("express");
const router = express.Router();

const terminal = require("../core/terminal/terminal.js");

// run command
router.post("/run", (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command required" });
    }

    const output = terminal.executeCommand(command);

    res.json({
      command,
      output
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;