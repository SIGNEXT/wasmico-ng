#include <stdint.h>
#include <cstddef>

#define WASM_EXPORT                   extern "C" __attribute__((used)) __attribute__((visibility ("default")))
#define WASM_IMPORT(MODULE,NAME)      __attribute__((import_module(MODULE))) __attribute__((import_name(NAME)))

extern "C" {
    WASM_IMPORT("arduino", "delay")           void delay          (uint32_t ms);
    WASM_IMPORT("arduino", "pinMode")         void pinMode        (uint32_t pin, uint32_t mode);
    WASM_IMPORT("arduino", "digitalWrite")    void digitalWrite   (uint32_t pin, uint32_t value);
    WASM_IMPORT("arduino", "print")           void print          (const char* s, size_t len);
    WASM_IMPORT("arduino", "saveTaskState")   void saveTaskState  (const uint8_t* state, size_t len, const char* filename);
    WASM_IMPORT("arduino", "resumeTask")      int resumeTask      (const uint8_t* state, const char* filename);

    static inline size_t strlen(const char *str) {
        const char *s;
        for (s = str; *s; ++s);
        return (s - str);
    }

    static inline void print (const char* s) {
        print(s, strlen(s));
    }

    static inline void println (const char* s) {
        print(s); print("\n");
    }
}

const char* filename = "/tasks/newexample.wasm";
uint8_t state[1];

int cnt;
char str[2];

void _setup() {
    int len = resumeTask((uint8_t*) state, filename);
    if (len == 1) {
        println("Task was resumed!");
        cnt = state[0];
    }
    else {
        println("This is a new task or state was corrupted!");
        cnt = 48;
    }
}

void _loop() {
    str[0] = cnt; str[1] = '\0';
    print("Counter: "); println(str);
    cnt++;
    delay(2000);
}

WASM_EXPORT
void _start() {
    _setup();
    while (1) { _loop(); }
}

WASM_EXPORT
void _state() {
    println("Calling state operation");
    saveTaskState((uint8_t*) str, 1, filename);
}