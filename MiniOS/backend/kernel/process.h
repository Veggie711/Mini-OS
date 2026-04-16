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
    int ioWaitTime;
    int priority;

    Process(int id, std::string n, int burst, int pr);
};
