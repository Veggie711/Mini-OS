const terminal = require("./core/terminal/terminal.js");
const fsCore = require("./core/filesystem/fs");

console.log("🧪 Testing Terminal CD Validation...");

try {
  // Reset disk for clean state
  fsCore.resetDisk();

  // Test 1: cd to an existing directory
  console.log("\nTest 1: cd to 'home'");
  let res1 = terminal.executeCommand("cd home");
  console.log("Result:", res1);
  if (res1 !== "") throw new Error("Failed to cd to existing directory");

  // Test 2: cd to a non-existent directory
  console.log("\nTest 2: cd to 'ghost_folder' (should fail)");
  let res2 = terminal.executeCommand("cd ghost_folder");
  console.log("Result:", res2);
  if (!res2.includes("No such directory")) throw new Error("cd should have failed for ghost_folder");

  // Test 3: cd to a file (should fail)
  console.log("\nTest 3: cd to 'home.txt' (should fail because it's a file)");
  let res3 = terminal.executeCommand("cd home.txt");
  console.log("Result:", res3);
  if (!res3.includes("No such directory")) throw new Error("cd should have failed for a file");

  // Test 4: cd ..
  console.log("\nTest 4: cd .. (go back to root)");
  let res4 = terminal.executeCommand("cd ..");
  console.log("Result:", res4);
  if (res4 !== "") throw new Error("Failed to cd ..");

  console.log("\n✅ CD validation tests passed!");
} catch (err) {
  console.error("\n❌ Test failed:", err.message);
  process.exit(1);
}
