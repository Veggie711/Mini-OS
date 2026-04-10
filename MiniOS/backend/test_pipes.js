const terminal = require("./core/terminal/terminal.js");
const fsCore = require("./core/filesystem/fs");

console.log("🧪 Testing Pipes, Grep, and WC...");

try {
  fsCore.resetDisk();
  
  // Setup: Create some files
  terminal.executeCommand("mkdir docs");
  terminal.executeCommand("touch docs/notes.txt some notes here");
  terminal.executeCommand("touch docs/todo.txt buy milk");
  terminal.executeCommand("touch docs/readme.md hello world");

  console.log("\nTest 1: Simple LS | GREP");
  let res1 = terminal.executeCommand("ls docs | grep notes");
  console.log("Result:", JSON.stringify(res1));
  if (res1.trim() !== "notes.txt") throw new Error("Grep failed to find notes.txt");

  console.log("\nTest 2: LS | WC (count files)");
  let res2 = terminal.executeCommand("ls docs | wc");
  console.log("Result:", res2);
  if (res2 !== "3") throw new Error("WC failed to count 3 files in docs");

  console.log("\nTest 3: Triple Pipe (LS | GREP | WC)");
  let res3 = terminal.executeCommand("ls docs | grep .txt | wc");
  console.log("Result:", res3);
  if (res3 !== "2") throw new Error("Triple pipe failed (expected 2 .txt files)");

  console.log("\nTest 4: Grep case insensitivity");
  let res4 = terminal.executeCommand("ls docs | grep TODO");
  console.log("Result:", res4);
  if (res4.trim() !== "todo.txt") throw new Error("Grep failed case insensitive search");

  console.log("\n✅ All Pipe tests passed!");
} catch (err) {
  console.error("\n❌ Pipe test failed:", err.message);
  process.exit(1);
}
