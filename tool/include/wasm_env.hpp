#ifndef WasmEnv_H
#define WasmEnv_H

#pragma once

#include <ArduinoJson.h>
#include <wasm3.h>
#include <map>

struct TaskState {
    uint8_t* state;
    size_t len;
};

void createEnvironment();

IM3Runtime createWasmRuntime(String filename);

void runWasmFunction(IM3Runtime runtime, const char* functionName);

void runWasmThread(void* parameters);

void runWasmPause(void* parameters);

void createWasmTask(String filename);

void removeWasmTask(String filename);

M3Result bindWasmFunctions(IM3Runtime runtime);

void callWasmFunction(IM3Runtime runtime, const char* functionName);

bool isTaskActive(String filename);

void liveUpdateTask(String filename);

bool pauseTask(String filename);

bool resumeTask(String filename);

TaskState getTaskState(String filename);

void saveTaskState(String filename, uint8_t* state, size_t len);

void removeTaskState(String filename);

bool isTaskPaused(String filename);

String listActiveTasksJson();

// TODO: remove this function after
bool to_hex(char* dest, size_t dest_len, const uint8_t* values, size_t val_len);

#endif