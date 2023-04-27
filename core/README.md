# @wasmico/core

This package contains the core code needed to send commands to the ESP32 devices running Wasmico.

It is designed to be imported into the user's code and allows the developer to build their own tool that uses the available commands.

## Installation

On your nodejs project install the wasmico package using the following command:

`npm i wasmico`

After that, import the @wasmico/core package into your program:

`import wasmico from 'wasmico/core'`

or

`const wasmico = require('wasmico/core')`

## Available commands

- `uploadTask` - Uploads a task that was previously compiled to WASM
    - `deviceIP` - IP of the ESP32 device
    - `filepath` - Path to the WASM file, the filename (without folders) will be used later
    - `reserverStackSize` - Size, in bytes, for the FreeRTOS that will execute the WASM routine
    - `reservedInitialMemory` - `initial-memory` parameter used in the compilation to WebAssembly
    - `memoryLimit` - `stack-size` parameter used in the compilation to WebAssembly
    - `liveUpdate` - Restart the task if it is already running
---
- `deleteTask` - Remove a task and all related information from the device
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to remove
---
- `startTask` - Start a task in the device
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to start
---
- `stopTask` - Stop a running task. After this, you can start the task again and it will start from the last saved state or, if there is no state, from the initial state
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to stop
---
- `pauseTask` - Pause a task temporarily
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to pause
---
- `resumeTask` - Resume a task that was previously paused. This will resume the task in the same state it was when paused. If you have uploaded a new state and want it to resume from that state, stop the task and start it again
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to resume
---
- `getTaskDetails` - Get the details of a task (filename, reservedStackSize, reservedInitialMemory and memoryLimit)
    - `deviceIP` - IP of the ESP32 device
---
- `editTaskDetails` - Edits the details of an already uploaded task
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to edit
    - `reserverStackSize` - Size, in bytes, for the FreeRTOS that will execute the WASM routine
    - `reservedInitialMemory` - `initial-memory` parameter used in the compilation to WebAssembly
    - `memoryLimit` - `stack-size` parameter used in the compilation to WebAssembly
---
- `getTaskState` - Get the state of a running task in JSON format. This state can be used without changing to be uploaded to a device
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to get the state from
---
- `uploadTaskState` - Uploads the state of a task in JSON format. The state should be the same as the result of the `getTaskState` command
    - `deviceIP` - IP of the ESP32 device
    - `filename` - Name of the file to which the state corresponds
    - `state` - JSON object with a `data` field that contains a string with the state of the file in hexadecimal and `len` which is the number of bytes in length
---
- `getActiveTaskDetails` - Get information about the currently running tasks. Retrieves the filename, status (running or paused) and stack high water mark (maximum amount of memory used) for every started task.
    - `deviceIP` - IP of the ESP32 device
---
- `getFreeHeapSize` - Get the free heap size, the largest free block size on the ESP32. When starting a task, the `reservedStackSize` of that task should alway be lower than the largest free block size
    - `deviceIP` - IP of the ESP32 device
---
- `restartDevice` - Restarts an ESP32 device
    - `deviceIP` - IP of the ESP32 device
---
- `scanNetwork` - Scan a network for all the available ESP32 running Wasmico
    - `network` - String containing the IP and mask of the network, p.e. `192.168.1.0/24`