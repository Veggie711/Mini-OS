const fsCore = require("../filesystem/fs");

let currentPath = "/";

// Robust path normalization (handles .., ., and current directory state)
function resolvePath(inputPath) {
  if (!inputPath) return currentPath;

  // 1. Join with current path if it's relative
  let combined;
  if (inputPath.startsWith("/")) {
    combined = inputPath;
  } else {
    combined = currentPath === "/" ? `/${inputPath}` : `${currentPath}/${inputPath}`;
  }

  // 2. Normalize (handle .. and .)
  const parts = combined.split("/").filter(Boolean);
  const stack = [];

  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else if (part !== ".") {
      stack.push(part);
    }
  }

  return "/" + stack.join("/");
}

// helper to split a path into (parent, name)
function getParentAndName(inputPath) {
  const fullPath = resolvePath(inputPath);
  if (fullPath === "/") return { parent: "/", name: "" };

  const parts = fullPath.split("/").filter(Boolean);
  const name = parts.pop();
  const parent = "/" + parts.join("/");
  return { parent, name };
}

function splitByPipes(input) {
  const parts = [];
  let current = "";
  let inQuotes = false;

  for (let char of input) {
    if (char === '"') inQuotes = !inQuotes;

    if (char === "|" && !inQuotes) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

// better argument parsing (handles quotes)
function parseArgs(cmd) {
  const matches = cmd.match(/"[^"]*"|[^\s]+/g) || [];
  return matches.map(arg => arg.replace(/"/g, ""));
}


function executeSingleCommand(input, pipedInput = null) {
  const parts = parseArgs(input);
  const cmd = parts[0];
  const args = parts.slice(1);

  if (!cmd) return pipedInput || "";

  switch (cmd) {

    case "ls": {
      const list = fsCore.listDir(resolvePath(args[0]));
      return list.join("\n");
    }

    case "cat":
      return fsCore.readFile(resolvePath(args[0]));

    case "touch": {
      const { parent, name } = getParentAndName(args[0]);
      const content = args.slice(1).join(" ");
      fsCore.createFile(parent, name, content);
      return `File created: ${name}`;
    }

    case "write":
      fsCore.writeFile(resolvePath(args[0]), args.slice(1).join(" "));
      return `File updated: ${args[0]}`;

    case "mkdir": {
      const { parent, name } = getParentAndName(args[0]);
      fsCore.mkdir(parent, name);
      return `Directory created: ${name}`;
    }

    case "rm": {
      const target = args[0] === "-r" ? args[1] : args[0];
      if (args[0] === "-r") {
        fsCore.deleteRecursive(resolvePath(target));
      } else {
        fsCore.deleteFile(resolvePath(target));
      }
      return `Removed: ${target}`;
    }

    case "rmdir": {
      const target = resolvePath(args[0]);
      if (!fsCore.isDirectory(target)) {
        throw new Error("Not a directory");
      }
      fsCore.deleteFile(target);
      return `Directory removed: ${args[0]}`;
    }

    case "pwd":
      return `Current directory: ${currentPath}`;

    case "cd": {
      const targetPath = resolvePath(args[0] || "/");
      if (fsCore.isDirectory(targetPath)) {
        currentPath = targetPath;
        return `Changed directory to: ${currentPath}`;
      } else {
        throw new Error("No such directory");
      }
    }

    // 🔥 PIPE COMMANDS

    case "grep": {
      const inputToSearch = pipedInput || "";
      const pattern = args[0];
      if (!pattern) return inputToSearch;
      
      return inputToSearch
        .split("\n")
        .filter(line => line.toLowerCase().includes(pattern.toLowerCase()))
        .join("\n");
    }

    case "wc": {
      const inputToCount = pipedInput || "";
      if (!inputToCount) return "0";
      const lines = inputToCount.split("\n").filter(line => line.trim().length > 0);
      return String(lines.length);
    }

    case "echo":
      return args.join(" ");

    default:
      return `Command not found: ${cmd}`;
  }
}
// main executor
function executeCommand(input) {
  try {
    let commandPart = input;
    let redirectionType = null;
    let redirectionTarget = null;
    let inputRedirectionTarget = null;

    // Robust redirection parsing (respecting quotes)
    let inQuotes = false;
    for (let i = input.length - 1; i >= 0; i--) {
      const char = input[i];
      if (char === '"') inQuotes = !inQuotes;

      if (!inQuotes) {
        if (input.substring(i - 1, i + 1) === ">>") {
          redirectionType = ">>";
          commandPart = input.substring(0, i - 1).trim();
          redirectionTarget = input.substring(i + 1).trim();
          break;
        } else if (char === ">") {
          redirectionType = ">";
          commandPart = input.substring(0, i).trim();
          redirectionTarget = input.substring(i + 1).trim();
          break;
        }
      }
    }

    // Input redirection parsing
    inQuotes = false;
    for (let i = 0; i < commandPart.length; i++) {
      const char = commandPart[i];
      if (char === '"') inQuotes = !inQuotes;

      if (!inQuotes && char === "<") {
        const remaining = commandPart.substring(i + 1);
        const match = remaining.match(/^\s*([^|>]+)/);
        if (match) {
          inputRedirectionTarget = match[1].trim();
          const fullMatch = match[0];
          commandPart = commandPart.substring(0, i) + remaining.substring(fullMatch.length);
          commandPart = commandPart.trim();
        }
        break;
      }
    }

    const commands = splitByPipes(commandPart);

    let output = null;

    if (inputRedirectionTarget) {
      output = fsCore.readFile(resolvePath(inputRedirectionTarget));
    }

    for (let cmd of commands) {
      output = executeSingleCommand(cmd, output);
    }

    if (redirectionType) {
      const targetPath = resolvePath(redirectionTarget);
      if (redirectionType === ">") {
        if (fsCore.exists(targetPath)) {
          fsCore.writeFile(targetPath, output || "");
        } else {
          const { parent, name } = getParentAndName(redirectionTarget);
          fsCore.createFile(parent, name, output || "");
        }
      } else if (redirectionType === ">>") {
        if (fsCore.exists(targetPath)) {
          fsCore.appendFile(targetPath, output || "");
        } else {
          const { parent, name } = getParentAndName(redirectionTarget);
          fsCore.createFile(parent, name, output || "");
        }
      }
      return `Output redirected to: ${redirectionTarget}`;
    }

    return output || "";

  } catch (err) {
    return `Error: ${err.message}`;
  }
}

module.exports = { executeCommand };