#pragma once
#include <mutex>

class Mutex {
private:
    std::mutex mtx;

public:
    void lock();
    void unlock();
};
