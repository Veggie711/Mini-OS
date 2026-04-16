#pragma once
#include "process_manager.h"
#include <queue>

class Scheduler {
private:
    ProcessManager &pm;
    std::queue<int> readyQueue;
    std::vector<int> waitingQueue;
    int quantum;

    void updateWaitingProcesses();

public:
    Scheduler(ProcessManager &manager, int q);
    void addProcess(int pid);
    void waitProcess(int pid);
    void run();
};
