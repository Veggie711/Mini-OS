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
    void setNextPID(int pid);
    std::vector<Process>& getProcesses();
};
