#ifndef Utils_H
#define Utils_H

#pragma once

#include <ESP32WebServer.h>

String createErrorMessage(String message);

String createSuccessMessage(String message);

String createJsonMessage(String message, int statusCode);

String createHeapDetailsJsonMessage();

unsigned int getAvailableStackSizeForTask();

String createJsonMessageFromBytes(uint8_t* data, size_t len, int statusCode);

uint8_t* bytesFromString(String data);

#endif