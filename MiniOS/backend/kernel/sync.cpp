#include "sync.h"

void Mutex::lock() {
    mtx.lock();
}

void Mutex::unlock() {
    mtx.unlock();
}
