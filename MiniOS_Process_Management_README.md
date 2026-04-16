# 🖥️ MiniOS: Process Management & Scheduling (C++ Kernel)

## 🚀 Overview

This module extends MiniOS from a **Terminal + Virtual File System** into a true **OS simulation** by adding:

- Process Management
- CPU Scheduling
- Synchronization (Mutex)
- Multithreading

---

## 🧠 Architecture

```
Terminal (UI)
   ↓
Node.js (Command Parser)
   ↓
C++ Kernel Simulator
   ├── Process Manager
   ├── Scheduler
   ├── Synchronization
```

---

## ⚙️ Core Concepts

### 🔹 Process
A process is a program in execution with:
- PID
- State
- CPU Burst Time
- Priority

---

### 🔹 Process States

```
READY → RUNNING → WAITING → TERMINATED
```

---

### 🔹 Scheduler
Controls which process runs on CPU.

---

### 🔹 Round Robin Scheduling
- Each process gets a fixed time slice (quantum)
- If not finished → goes back to queue

---

### 🔹 Synchronization
Used to prevent race conditions when multiple processes access shared resources.

---

## 🏗️ Project Structure

```
kernel/
 ├── process.h
 ├── process.cpp
 ├── process_manager.h
 ├── process_manager.cpp
 ├── scheduler.h
 ├── scheduler.cpp
 ├── sync.h
 ├── sync.cpp
 ├── main.cpp
```

---

# ⚙️ Implementation

## 🧩 1. Process Class

### process.h
```cpp
#pragma once
#include <string>

enum State {
    READY,
    RUNNING,
    WAITING,
    TERMINATED
};

class Process {
public:
    int pid;
    std::string name;
    State state;
    int burstTime;
    int remainingTime;
    int priority;

    Process(int id, std::string n, int burst, int pr);
};
```

---

### process.cpp
```cpp
#include "process.h"

Process::Process(int id, std::string n, int burst, int pr) {
    pid = id;
    name = n;
    burstTime = burst;
    remainingTime = burst;
    priority = pr;
    state = READY;
}
```

---

## 🧩 2. Process Manager

### process_manager.h
```cpp
#pragma once
#include "process.h"
#include <vector>

class ProcessManager {
private:
    std::vector<Process> processes;
    int nextPID;

public:
    ProcessManager();
    int createProcess(std::string name, int burst, int priority);
    void killProcess(int pid);
    std::vector<Process>& getProcesses();
};
```

---

### process_manager.cpp
```cpp
#include "process_manager.h"

ProcessManager::ProcessManager() {
    nextPID = 1;
}

int ProcessManager::createProcess(std::string name, int burst, int priority) {
    processes.push_back(Process(nextPID, name, burst, priority));
    return nextPID++;
}

void ProcessManager::killProcess(int pid) {
    for (auto &p : processes) {
        if (p.pid == pid) {
            p.state = TERMINATED;
        }
    }
}

std::vector<Process>& ProcessManager::getProcesses() {
    return processes;
}
```

---

## ⏱️ 3. Scheduler (Round Robin)

### scheduler.h
```cpp
#pragma once
#include "process_manager.h"
#include <queue>

class Scheduler {
private:
    ProcessManager &pm;
    std::queue<int> readyQueue;
    int quantum;

public:
    Scheduler(ProcessManager &manager, int q);
    void addProcess(int pid);
    void run();
};
```

---

### scheduler.cpp
```cpp
#include "scheduler.h"
#include <thread>
#include <chrono>
#include <iostream>

Scheduler::Scheduler(ProcessManager &manager, int q) : pm(manager) {
    quantum = q;
}

void Scheduler::addProcess(int pid) {
    readyQueue.push(pid);
}

void Scheduler::run() {
    while (!readyQueue.empty()) {
        int pid = readyQueue.front();
        readyQueue.pop();

        auto &processes = pm.getProcesses();

        for (auto &p : processes) {
            if (p.pid == pid && p.state != TERMINATED) {
                p.state = RUNNING;

                int execTime = std::min(quantum, p.remainingTime);
                std::this_thread::sleep_for(std::chrono::milliseconds(execTime * 200));

                p.remainingTime -= execTime;

                if (p.remainingTime > 0) {
                    p.state = READY;
                    readyQueue.push(pid);
                } else {
                    p.state = TERMINATED;
                    std::cout << "Process " << pid << " finished\n";
                }
            }
        }
    }
}
```

---

## 🔐 4. Synchronization (Mutex)

### sync.h
```cpp
#pragma once
#include <mutex>

class Mutex {
private:
    std::mutex mtx;

public:
    void lock();
    void unlock();
};
```

---

### sync.cpp
```cpp
#include "sync.h"

void Mutex::lock() {
    mtx.lock();
}

void Mutex::unlock() {
    mtx.unlock();
}
```

---

### Example Usage
```cpp
Mutex fileLock;

void accessFile(int pid) {
    fileLock.lock();

    std::cout << "Process " << pid << " using file\n";
    std::this_thread::sleep_for(std::chrono::seconds(2));

    fileLock.unlock();
}
```

---

## 🧵 5. Multithreading

Run scheduler in a separate thread:

```cpp
std::thread t(&Scheduler::run, &scheduler);
t.detach();
```

---

## 🔗 6. Terminal Command Mapping

| Command       | Action |
|--------------|--------|
| `run app1`   | create process |
| `ps`         | list processes |
| `kill <pid>` | terminate process |
| `start`      | start scheduler |

---

## 🔌 7. Node.js Integration (Basic)

```js
const { exec } = require("child_process");

exec("./kernel run app1 5", (err, stdout) => {
    console.log(stdout);
});
```

---

# 🚀 Build Roadmap

## ✅ Phase 1
- Process class
- Process manager
- create / kill / ps

## ✅ Phase 2
- Round Robin scheduler

## ✅ Phase 3
- Multithreading

## ✅ Phase 4
- Mutex synchronization

## ✅ Phase 5
- Connect to terminal

---

# 🔥 Advanced Features (Optional)

- `sleep(pid)` → WAITING state
- I/O simulation
- Priority scheduling
- Deadlock simulation
- `top` / process monitor

---

# 💡 Notes

- This is a **simulation**, not a real OS
- Focus on **clean abstraction**
- Keep logic deterministic for debugging

---

# 🎯 Next Step

```
ProcessManager → create / kill / ps
```

Then gradually move to scheduler and synchronization.

---

## 🏁 Goal

By completing this, you will have:
- A working OS simulation kernel
- Strong understanding of OS concepts
- A high-impact system design project
