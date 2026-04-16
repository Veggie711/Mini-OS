#include "scheduler.h"
#include <thread>
#include <chrono>
#include <iostream>
#include <algorithm>

Scheduler::Scheduler(ProcessManager &manager, int q) : pm(manager) {
    quantum = q;
}

void Scheduler::addProcess(int pid) {
    readyQueue.push(pid);
}

void Scheduler::waitProcess(int pid) {
    waitingQueue.push_back(pid);
}

void Scheduler::updateWaitingProcesses() {
    auto &processes = pm.getProcesses();
    for (auto it = waitingQueue.begin(); it != waitingQueue.end(); ) {
        int pid = *it;
        bool ready = false;
        for (auto &p : processes) {
            if (p.pid == pid) {
                if (p.ioWaitTime > 0) {
                    p.ioWaitTime--;
                }
                if (p.ioWaitTime <= 0) {
                    p.state = READY;
                    readyQueue.push(pid);
                    ready = true;
                    std::cout << "Process " << pid << " finished I/O\n";
                }
                break;
            }
        }
        if (ready) {
            it = waitingQueue.erase(it);
        } else {
            ++it;
        }
    }
}

void Scheduler::run() {
    while (!readyQueue.empty() || !waitingQueue.empty()) {
        if (readyQueue.empty()) {
            // No process ready, just update waiting queue
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
            updateWaitingProcesses();
            continue;
        }

        int pid = readyQueue.front();
        readyQueue.pop();

        updateWaitingProcesses();

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
