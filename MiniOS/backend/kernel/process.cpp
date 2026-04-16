#include "process.h"

Process::Process(int id, std::string n, int burst, int pr) {
    pid = id;
    name = n;
    burstTime = burst;
    remainingTime = burst;
    ioWaitTime = 0;
    priority = pr;
    state = READY;
}
