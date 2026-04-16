# 🖥️ MiniOS: Process Management Implementation Report

This document summarizes the changes and additions made to the MiniOS project to implement the **Process Management & Scheduling** module.

---

## 🏗️ 1. Architecture Overview

The system now follows a three-tier architecture:
1.  **Frontend/Terminal (UI):** User enters commands like `run`, `ps`, and `start`.
2.  **Node.js Backend (Parser):** `terminal.js` intercepts process-related commands and delegates them to the C++ Kernel.
3.  **C++ Kernel (Simulation):** A standalone executable (`kernel.exe`) that manages the lifecycle of simulated processes, scheduling, and synchronization.

---

## 🧩 2. Core Components (C++)

The following files were created in the `backend/kernel/` directory:

### **Process Lifecycle (`process.h`, `process.cpp`)**
- Defines the `Process` class with attributes: `PID`, `Name`, `State` (READY, RUNNING, WAITING, TERMINATED), `BurstTime`, `RemainingTime`, and `Priority`.

### **Process Manager (`process_manager.h`, `process_manager.cpp`)**
- Tracks all active and terminated processes in a `std::vector`.
- Handles PID assignment and process termination.
- **State Persistence:** Included logic to save/load process states to `processes.txt`, ensuring the simulation "remembers" processes between command calls.

### **Scheduler (`scheduler.h`, `scheduler.cpp`)**
- Implements a **Round Robin** scheduling algorithm.
- Uses a `std::queue` for the Ready Queue.
- Simulates CPU execution by decrementing `RemainingTime` during a fixed `Quantum` (time slice).

### **Synchronization (`sync.h`, `sync.cpp`)**
- Wraps `std::mutex` into a `Mutex` class to prevent race conditions during multithreaded operations.

### **Kernel Main (`main.cpp`)**
- Acts as the CLI entry point for the compiled kernel.
- Maps command-line arguments to internal logic (e.g., `kernel run` -> `pm.createProcess`).

---

## 🔌 3. Integration & Terminal Support

The `backend/core/terminal/terminal.js` file was updated to bridge the Node.js environment with the C++ Kernel:

- **Command Delegation:** Commands like `run`, `ps`, `kill`, `start`, and `sync-test` are now executed via `child_process.execSync`, calling the `kernel.exe`.
- **Dynamic Execution:** The backend dynamically locates the kernel binary and manages the execution context.

---

## 🚀 4. New Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `run` | Creates a new process with optional burst and priority. | `run MyApp 10 1` |
| `ps` | Displays a table of all processes and their current states. | `ps` |
| `kill` | Terminates a process by its PID. | `kill 1` |
| `start` | Starts the Round Robin scheduler to execute READY processes. | `start` |
| `sync-test` | Runs a multithreaded demo showing Mutex locking in action. | `sync-test` |

---

## 🛠️ 5. Build & Environment

- **Compiler:** Compiled using `g++` with `-pthread` support.
- **Binary:** Located at `backend/kernel/kernel.exe`.
- **State File:** `backend/kernel/processes.txt` (Auto-generated on first run).

---

## ✅ Implementation Status
- [x] Phase 1: Process Class & Manager
- [x] Phase 2: Round Robin Scheduler
- [x] Phase 3: Multithreading Support
- [x] Phase 4: Mutex Synchronization
- [x] Phase 5: Terminal Integration
