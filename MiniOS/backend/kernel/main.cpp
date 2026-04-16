#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <iomanip>
#include "process_manager.h"
#include "scheduler.h"

void saveState(ProcessManager& pm) {
    std::ofstream file("processes.txt");
    for (auto& p : pm.getProcesses()) {
        file << p.pid << " " << p.name << " " << (int)p.state << " " << p.burstTime << " " << p.remainingTime << " " << p.ioWaitTime << " " << p.priority << "\n";
    }
}

void loadState(ProcessManager& pm) {
    std::ifstream file("processes.txt");
    if (!file.is_open()) return;

    int pid, stateInt, burst, remaining, ioWait, priority;
    std::string name;
    std::vector<Process>& processes = pm.getProcesses();
    processes.clear();

    int maxPid = 0;
    while (file >> pid >> name >> stateInt >> burst >> remaining >> ioWait >> priority) {
        Process p(pid, name, burst, priority);
        p.state = static_cast<State>(stateInt);
        p.remainingTime = remaining;
        p.ioWaitTime = ioWait;
        processes.push_back(p);
        if (pid >= maxPid) maxPid = pid + 1;
    }
    pm.setNextPID(maxPid == 0 ? 1 : maxPid);
}


#include "sync.h"
#include <thread>

void accessResource(int id, Mutex& mtx) {
    mtx.lock();
    std::cout << "Thread " << id << " acquired mutex and is accessing shared resource" << '\n';
    std::this_thread::sleep_for(std::chrono::seconds(1));
    std::cout << "Thread " << id << " released mutex" << '\n';
    mtx.unlock();
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "Usage: kernel <command> [args...]" << '\n';
        return 1;
    }

    std::string command = argv[1];
    ProcessManager pm;
    loadState(pm);

    if (command == "run") {
        if (argc < 3) {
            std::cout << "Usage: kernel run <name> [burst] [priority]" << '\n';
            return 1;
        }
        std::string name = argv[2];
        int burst = (argc > 3) ? std::stoi(argv[3]) : 5;
        int priority = (argc > 4) ? std::stoi(argv[4]) : 1;

        int pid = pm.createProcess(name, burst, priority);
        std::cout << "Process created with PID: " << pid << '\n';
        saveState(pm);
    } else if (command == "ps") {
        std::cout << std::left << std::setw(5) << "PID" 
                  << std::setw(15) << "Name" 
                  << std::setw(12) << "State" 
                  << std::setw(10) << "Burst" 
                  << std::setw(12) << "Remaining" 
                  << std::setw(10) << "I/O Wait"
                  << "Priority" << '\n';
        for (auto& p : pm.getProcesses()) {
            std::string stateStr;
            switch (p.state) {
                case READY: stateStr = "READY"; break;
                case RUNNING: stateStr = "RUNNING"; break;
                case WAITING: stateStr = "WAITING"; break;
                case TERMINATED: stateStr = "TERMINATED"; break;
            }
            std::cout << std::left << std::setw(5) << p.pid 
                      << std::setw(15) << p.name 
                      << std::setw(12) << stateStr 
                      << std::setw(10) << p.burstTime 
                      << std::setw(12) << p.remainingTime 
                      << std::setw(10) << (p.state == WAITING ? std::to_string(p.ioWaitTime) : "-")
                      << p.priority << '\n';
        }
    } else if (command == "kill") {
        if (argc < 3) {
            std::cout << "Usage: kernel kill <pid>" << '\n';
            return 1;
        }
        int pid = std::stoi(argv[2]);
        pm.killProcess(pid);
        std::cout << "Process " << pid << " killed" << '\n';
        saveState(pm);
    } else if (command == "sleep") {
        if (argc < 4) {
            std::cout << "Usage: kernel sleep <pid> <time>" << '\n';
            return 1;
        }
        int pid = std::stoi(argv[2]);
        int sleepTime = std::stoi(argv[3]);
        for (auto &p : pm.getProcesses()) {
            if (p.pid == pid) {
                p.state = WAITING;
                p.ioWaitTime = sleepTime;
                std::cout << "Process " << pid << " is now WAITING for " << sleepTime << " units" << '\n';
                break;
            }
        }
        saveState(pm);
    } else if (command == "io") {
        if (argc < 3) {
            std::cout << "Usage: kernel io <pid>" << '\n';
            return 1;
        }
        int pid = std::stoi(argv[2]);
        for (auto &p : pm.getProcesses()) {
            if (p.pid == pid) {
                p.state = WAITING;
                p.ioWaitTime = 5; // Fixed I/O time
                std::cout << "Process " << pid << " is now WAITING for I/O (5 units)" << '\n';
                break;
            }
        }
        saveState(pm);
    } else if (command == "start") {
        Scheduler scheduler(pm, 2); // Quantum = 2
        for (auto& p : pm.getProcesses()) {
            if (p.state == READY) {
                scheduler.addProcess(p.pid);
            } else if (p.state == WAITING) {
                scheduler.waitProcess(p.pid);
            }
        }
        scheduler.run();
        saveState(pm);
    } else if (command == "sync-test") {
        Mutex mtx;
        std::thread t1(accessResource, 1, std::ref(mtx));
        std::thread t2(accessResource, 2, std::ref(mtx));
        t1.join();
        t2.join();
    } else {
        std::cout << "Unknown command: " << command << '\n';
    }

    return 0;
}
