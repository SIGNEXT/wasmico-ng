#!/usr/bin/env node

import wasmico from './index.js'

await wasmico
    .uploadTask({
        deviceIP: '192.168.1.116',
        filename: 'newexample.wasm',
        reservedStackSize: 10000,
        reservedInitialMemory: 65336,
        memoryLimit: 4096,
    })
    .then((response) => {
        console.log(response)
    })
    .catch((response) => {
        console.log(response)
    })

