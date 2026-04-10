# MiniOS: Web-Based OS Simulation - Project Status & Roadmap

## 🚀 Project Overview
MiniOS is a high-fidelity web-based Operating System simulation built from scratch. It simulates core OS concepts like a Virtual Filesystem, Terminal, Process Management, and Scheduling without using a custom kernel, running entirely on a Node.js/Express backend with a C++ powered core.

---

## 🏗️ Current Architecture

### 1. Virtual Filesystem (VFS)
- **Persistence:** State is persisted in `virtualFS/disk.json`.
- **Inode System:** Simulates files and directories using an Inode-based structure.
- **Capabilities:**
    - `createFile`, `readFile`, `writeFile`, `appendFile`.
    - `mkdir`, `listDir`, `isDirectory`.
    - `deleteFile`, `deleteRecursive` (rm -r).
    - `exists` utility for path validation.

### 2. Terminal Core
- **Command Parser:** Supports argument parsing with quoted strings (e.g., `echo "hello world"`).
- **Execution Engine:** Handles command routing and error reporting.
- **Descriptive Feedback:** All commands return human-readable status messages (e.g., `Changed directory to: /home`).

### 3. I/O Redirection & Pipes
- **Pipes (`|`):** Support for chaining multiple commands (e.g., `ls | grep .txt | wc`).
- **Output Redirection (`>`, `>>`):** Support for overwriting or appending command output to virtual files.
- **Input Redirection (`<`):** Support for feeding file content into commands as stdin.
- **Quote Awareness:** Redirection operators inside quotes are treated as literal text.

---

## 🛠️ Finalized Roadmap: System Simulation

### 1. Process Management (The "Process Table")
We will implement a `ProcessManager` to track active tasks.
- **Process Control Block (PCB):** Each process will have a PID, Parent PID, State (Ready, Running, Blocked, Zombie), Priority, and Owner (UID).
- **Signals:** Support for `SIGINT` (Ctrl+C), `SIGTERM`, and `SIGKILL`.
- **States:** Simulating the 5-state process model.

### 2. C++ Scheduler Core (The "Hardcore" Layer)
To achieve high-performance and realistic scheduling, we are moving the "Brain" of the OS into C++.
- **Technology:** Node.js C++ Addon (N-API).
- **Responsibilities:**
    - Managing the **Ready Queue**.
    - Implementing **Time Slicing** (Preemption).
    - **Differential Algorithms:**
        - **Round Robin (RR):** Equal time slices for all tasks.
        - **Shortest Job First (SJF):** Efficient burst management.
        - **Multi-Level Feedback Queue (MLFQ):** Advanced dynamic priority adjustment (Standard in modern OSs).

### 3. Synchronization Primitives
Simulation of classic concurrency tools using C++ logic:
- **Mutexes:** To prevent virtual "Race Conditions" on shared resources (like writing to the same file).
- **Condition Variables:** A "Wait/Notify" system for processes waiting on specific system states.
- **Deadlock Detection:** Background monitoring of resource allocation graphs.

### 4. Security & Permissions
- **User System:** `/etc/passwd` simulation with `root` and standard users.
- **Permission Bits:** `rwxrwxrwx` (Read, Write, Execute) simulation.
- **Sudo:** Temporary elevation of privileges for the current process.

---

## 📂 Current File Structure
```text
MiniOS/
├── backend/
│   ├── core/
│   │   ├── filesystem/
│   │   │   └── fs.js         # Virtual Disk Logic
│   │   ├── terminal/
│   │   │   └── terminal.js   # Command Parser & Redirection
│   │   └── system/           # [NEXT] Process & Scheduler Logic
│   ├── server.js             # API Entry Point
│   └── binding.gyp           # [NEXT] C++ Compilation Config
├── virtualFS/
│   └── disk.json             # Persistent Storage
└── frontend/                 # Web Terminal UI
```

---

## 🎯 Next Objective
**Develop the C++ Scheduler Addon.** 
We will start by defining the C++ `Process` class and the `Scheduler` class that interfaces with the Node.js event loop to manage virtual PIDs.
