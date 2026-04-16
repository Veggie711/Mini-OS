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

void ProcessManager::setNextPID(int pid) {
    nextPID = pid;
}

std::vector<Process>& ProcessManager::getProcesses() {
    return processes;
}
