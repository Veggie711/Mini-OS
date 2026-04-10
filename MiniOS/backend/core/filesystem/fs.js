const fs = require("fs");
const path = require("path");

const DISK_PATH = path.join(__dirname, "../../../virtualFS/disk.json");

let inodeCounter = 0;
let inodes = {};
let root = {
  type: "dir",
  name: "/",
  entries: {}
};

// ================= PERSISTENCE =================
function saveToDisk() {
  const data = JSON.stringify({ inodeCounter, inodes, root }, null, 2);
  fs.writeFileSync(DISK_PATH, data);
}

function loadFromDisk() {
  if (fs.existsSync(DISK_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DISK_PATH, "utf8"));
      inodeCounter = data.inodeCounter;
      inodes = data.inodes;
      root = data.root;
      console.log("💾 Virtual Disk loaded successfully.");
    } catch (err) {
      console.error("❌ Failed to load Virtual Disk, starting fresh.");
      initFreshDisk();
    }
  } else {
    initFreshDisk();
  }
}

function initFreshDisk() {
  inodeCounter = 0;
  inodes = {};
  root = { type: "dir", name: "/", entries: {} };
  
  const homeInode = createInode("dir");
  root.entries["home"] = homeInode;
  
  const fileId = createInode("file");
  inodes[fileId].content = "Welcome to MiniOS!";
  inodes[homeInode].entries["home.txt"] = fileId;
  
  saveToDisk();
}

function resetDisk() {
  initFreshDisk();
  console.log("🔄 Virtual Disk reset to initial state.");
}

// ================= INODE =================
function createInode(type) {
  const id = inodeCounter++;

  inodes[id] = {
    id,
    type,
    content: "",
    entries: {},
    createdAt: new Date(),
    permissions: "rwx",
    links: 1
  };

  return id;
}

// ================= PATH RESOLUTION =================
function resolvePath(pathStr) {
  if (!pathStr || pathStr === "/") return root;

  const parts = pathStr.split("/").filter(Boolean);
  let current = root;

  for (let part of parts) {
    if (current.type !== "dir") {
      throw new Error("Not a directory");
    }

    const inodeId = current.entries[part];

    if (inodeId === undefined) {
      throw new Error("Path not found");
    }

    current = inodes[inodeId];
  }

  return current;
}

// ================= FILE OPS =================
function createFile(pathStr, name, content = "") {
  const dir = resolvePath(pathStr);

  if (dir.type !== "dir") throw new Error("Not a directory");
  if (dir.entries[name] !== undefined) throw new Error("Already exists");

  const inodeId = createInode("file");
  inodes[inodeId].content = content;

  dir.entries[name] = inodeId;
  saveToDisk();
}

function readFile(pathStr) {
  const file = resolvePath(pathStr);

  if (file.type !== "file") throw new Error("Not a file");

  return file.content;
}

function writeFile(pathStr, content) {
  const file = resolvePath(pathStr);
  if (file.type !== "file") throw new Error("Not a file");

  file.content = content;
  saveToDisk();
}

function appendFile(pathStr, content) {
  const file = resolvePath(pathStr);
  if (file.type !== "file") throw new Error("Not a file");

  file.content += content;
  saveToDisk();
}

// ================= UTILS =================
function exists(pathStr) {
  try {
    resolvePath(pathStr);
    return true;
  } catch (err) {
    return false;
  }
}

// ================= DIRECTORY OPS =================
function isDirectory(pathStr) {
  try {
    const node = resolvePath(pathStr);
    return node.type === "dir";
  } catch (err) {
    return false;
  }
}

function listDir(pathStr) {
  const dir = resolvePath(pathStr);

  if (dir.type !== "dir") throw new Error("Not a directory");

  return Object.keys(dir.entries);
}

function mkdir(pathStr, name) {
  const dir = resolvePath(pathStr);

  if (dir.type !== "dir") throw new Error("Not a directory");
  if (dir.entries[name] !== undefined) throw new Error("Already exists");

  const inodeId = createInode("dir");
  dir.entries[name] = inodeId;
  saveToDisk();
}

// ================= DELETE =================
function deleteFile(pathStr) {
  if (!pathStr || pathStr === "/") {
    throw new Error("Cannot delete root directory");
  }

  const parts = pathStr.split("/").filter(Boolean);
  const name = parts.pop();
  const parentPath = "/" + parts.join("/");

  const dir = resolvePath(parentPath || "/");
  const inodeId = dir.entries[name];

  if (inodeId === undefined) {
    throw new Error("Path not found");
  }

  const inode = inodes[inodeId];
  if (inode.type === "dir" && Object.keys(inode.entries).length > 0) {
    throw new Error("Directory not empty");
  }

  delete dir.entries[name];
  inodes[inodeId].links--;

  if (inodes[inodeId].links === 0) {
    delete inodes[inodeId];
  }
  saveToDisk();
}

function deleteRecursive(pathStr) {
  if (!pathStr || pathStr === "/") {
    throw new Error("Cannot delete root directory");
  }

  const node = resolvePath(pathStr);

  if (node.type === "dir") {
    const entries = Object.keys(node.entries);
    for (const entryName of entries) {
      const entryPath = pathStr.endsWith("/") ? `${pathStr}${entryName}` : `${pathStr}/${entryName}`;
      deleteRecursive(entryPath);
    }
  }

  // After children are gone (or if it's a file), delete this node
  const parts = pathStr.split("/").filter(Boolean);
  const name = parts.pop();
  const parentPath = "/" + parts.join("/");
  const parentDir = resolvePath(parentPath || "/");

  const inodeId = parentDir.entries[name];
  delete parentDir.entries[name];
  inodes[inodeId].links--;

  if (inodes[inodeId].links === 0) {
    delete inodes[inodeId];
  }
  saveToDisk();
}

// ================= HARD LINK =================
function createHardLink(targetPath, linkPath, name) {
  const target = resolvePath(targetPath);
  const dir = resolvePath(linkPath);

  if (dir.type !== "dir") throw new Error("Not a directory");
  if (dir.entries[name] !== undefined) throw new Error("Already exists");

  const inodeId = target.id;

  dir.entries[name] = inodeId;
  inodes[inodeId].links++;
  saveToDisk();
}

// ================= INIT =================
loadFromDisk();

// ================= EXPORT =================
module.exports = {
  createFile,
  readFile,
  writeFile,
  appendFile,
  exists,
  listDir,
  mkdir,
  deleteFile,
  deleteRecursive,
  createHardLink,
  resetDisk,
  isDirectory
};
