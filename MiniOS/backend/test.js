const fsCore = require("./core/filesystem/fs");

console.log("🧪 Starting Filesystem Core Tests...");

try {
  // Reset disk to ensure a clean state for tests
  fsCore.resetDisk();

  // Test 1: List root
  console.log("Test 1: List root");
  const rootFiles = fsCore.listDir("/");
  console.log("Root entries:", rootFiles);
  if (!rootFiles.includes("home")) throw new Error("home missing in /");

  // Test 2: Read sample file
  console.log("Test 2: Read sample file");
  const content = fsCore.readFile("/home/home.txt");
  console.log("Content:", content);
  if (content !== "Welcome to MiniOS!") throw new Error("Sample file content mismatch");

  // Test 3: Create directory
  console.log("Test 3: Create directory");
  fsCore.mkdir("/home", "docs");
  if (!fsCore.listDir("/home").includes("docs")) throw new Error("mkdir failed");

  // Test 4: Create file in new directory
  console.log("Test 4: Create file");
  fsCore.createFile("/home/docs", "todo.txt", "finish minios");
  if (fsCore.readFile("/home/docs/todo.txt") !== "finish minios") throw new Error("createFile failed");

  // Test 5: Delete file
  console.log("Test 5: Delete file");
  fsCore.deleteFile("/home/docs/todo.txt");
  try {
    fsCore.readFile("/home/docs/todo.txt");
    throw new Error("deleteFile failed to remove file");
  } catch (e) {
    if (e.message !== "Path not found") throw e;
  }
  console.log("File deleted successfully.");

  // Test 6: Delete directory
  console.log("Test 6: Delete directory");
  fsCore.deleteFile("/home/docs");
  if (fsCore.listDir("/home").includes("docs")) throw new Error("deleteFile failed to remove directory");
  console.log("Directory deleted successfully.");

  // Test 7: Hard links
  console.log("Test 7: Hard links");
  fsCore.createFile("/home", "original.txt", "original content");
  fsCore.createHardLink("/home/original.txt", "/home", "link.txt");
  if (fsCore.readFile("/home/link.txt") !== "original content") throw new Error("Hard link read failed");
  
  fsCore.writeFile("/home/original.txt", "updated content");
  if (fsCore.readFile("/home/link.txt") !== "updated content") throw new Error("Hard link update propagation failed");
  
  fsCore.deleteFile("/home/original.txt");
  if (fsCore.readFile("/home/link.txt") !== "updated content") throw new Error("Hard link persistence failed after original deletion");
  console.log("Hard link tests passed.");

  console.log("✅ All core tests passed!");
} catch (err) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}
