#include <ArduinoJson.h>

#include "utils.hpp"

String createErrorMessage(String message) {
    return createJsonMessage(message, 1);
}

String createSuccessMessage(String message) {
    return createJsonMessage(message, 0);
}

String createJsonMessage(String message, int statusCode) {
    return "{\"status_code\":" + String(statusCode) + ",\"message\":\"" + message + "\"}";
}

String createHeapDetailsJsonMessage() {
    StaticJsonDocument<JSON_OBJECT_SIZE(3)> jsonDocument;
    jsonDocument["free_heap_size"] = xPortGetFreeHeapSize();
    jsonDocument["largest_free_block_size"] = heap_caps_get_largest_free_block(MALLOC_CAP_EXEC);
    jsonDocument["status_code"] = 0;

    String res;
    serializeJson(jsonDocument, res);
    return res;
}

unsigned int getAvailableStackSizeForTask() {
    return heap_caps_get_largest_free_block(MALLOC_CAP_EXEC);
}

String createJsonMessageFromBytes(uint8_t* data, size_t len, int statusCode) {
    String json = "{\"status_code\": 200, \"data\":\"";
    for (int i = 0; i < len; i++) {
        char hex[3];
        sprintf(hex, "%02x", data[i]);
        json += hex;
    }
    json += "\", \"len\":" + String(len) + "}";
    return json;
}

uint8_t* bytesFromString(String data) {
    size_t length = data.length() / 2;
    uint8_t* bytes = (uint8_t*)malloc(data.length() / 2);
    char* ptr;
    const char* c_str = data.c_str();
    int i = 0;
    while (i < length) {
        sscanf(&c_str[i * 2], "%02x", &bytes[i]);
        i++;
    }
    return bytes;
}
