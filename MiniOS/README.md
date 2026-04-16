# 🖥️ MiniOS: Integrated Operating System Simulation

MiniOS is a sophisticated, full-stack simulation of an Operating System. It combines a **Node.js REST API**, a custom **Virtual File System (VFS)**, and a **C++ Kernel** to provide a realistic environment for exploring OS concepts like process scheduling, file I/O, and system synchronization.

---

## 🏗️ System Architecture

The project is built using a tiered architecture:
1.  **Backend (Express.js):** Provides a RESTful API for terminal interaction.
2.  **Virtual File System (Node.js):** A custom Inode-based filesystem with persistence to a `disk.json` file. Supports directories, files, and hard links.
3.  **Terminal Engine (Node.js):** Handles command parsing, argument handling, Unix-style pipes (`|`), and output redirection (`>` and `>>`).
4.  **Simulation Kernel (C++):** A standalone binary that simulates a low-level OS kernel, managing processes and CPU scheduling.

---

## 🛠️ Tech Stack

- **Server:** Node.js, Express.js
- **Kernel:** C++ (using `std::thread`, `std::mutex`, and `std::queue`)
- **Persistence:** JSON-based Virtual Disk, TXT-based Process State
- **Testing:** Hoppscotch / Postman / cURL

---

## 📦 Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- A C++ compiler (like `g++`) available in your system path.

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd Mini-OS/MiniOS/backend
npm install
```

### 3. Build the Kernel
You must compile the kernel binary specifically for your operating system:
```bash
cd kernel
g++ -o kernel main.cpp process.cpp process_manager.cpp scheduler.cpp sync.cpp -pthread
```
*Note: This creates `kernel.exe` on Windows or `kernel` on Linux/macOS.*

---

## 🚦 Running the System

### Start the API Server
From the `backend` folder:
```bash
npm start
```
The server will run on `http://localhost:5000`.

### Interaction via API
The system is controlled by sending `POST` requests to `http://localhost:5000/terminal/run`.

**Request Body Format:**
```json
{
  "command": "ls /home"
}
```

---

## ⌨️ Supported Terminal Commands

### 📂 File System Operations
- `ls [path]` - List directory contents.
- `cd [path]` - Change current directory.
- `pwd` - Print working directory.
- `mkdir [name]` - Create a new directory.
- `touch [name] [content]` - Create a new file.
- `cat [file]` - Read file content.
- `write [file] [content]` - Overwrite file content.
- `rm [-r] [path]` - Remove file or directory (recursive with `-r`).
- `rmdir [path]` - Remove an empty directory.

### 🚀 Process & Kernel Operations
- `run [name] [burst] [priority]` - Create a new simulated process.
- `ps` - View the current process table (PID, State, Burst, etc.).
- `kill [pid]` - Terminate a specific process.
- `start` - Launch the **Round Robin Scheduler** (simulates CPU execution).
- `sync-test` - Run a multithreaded demo of the **Mutex Synchronization** system.

### 🔗 Unix Features
- **Pipes (`|`):** Chain commands together (e.g., `ls | grep .txt | wc`).
- **Redirection (`>`, `>>`):** Save output to files (e.g., `ps > processes.log`).
- **Input Redirection (`<`):** Read command input from a file.
- **Utils:** `grep [pattern]`, `wc` (word/line count), `echo [text]`.

---

## 💾 Persistence
- **Filesystem:** Stored in `virtualFS/disk.json`.
- **Processes:** State saved in `backend/kernel/processes.txt`.
- To reset the entire system, simply delete these files or call the `resetDisk` utility in the code.

---

