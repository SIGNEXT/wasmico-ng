#! /usr/bin/env node
import wasmico from '../core/index.js'
import yargs from 'yargs'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(__filename);

const callFunctionAndPrint = (f, args) => {
    f(args)
        .then((response) => {
            console.log(response)
        })
        .catch((response) => {
            console.log(response)
        })
}

yargs(process.argv.slice(2))
    .command(
        'upload <deviceIP> <filepath> <reservedStackSize> <reservedInitialMemory> <memoryLimit> [liveUpdate]',
        'Upload a task',
        (yargs) => {
            yargs.positional('liveUpdate', { type: 'boolean', default: false })
        },
        (argv) => callFunctionAndPrint(wasmico.uploadTask, argv)
    )
    .command('delete <deviceIP> <filename>', 'Delete a task', {}, (argv) =>
        callFunctionAndPrint(wasmico.deleteTask, argv)
    )
    .command(
        'edit <deviceIP> <filepath> <reservedStackSize> <reservedInitialMemory> <memoryLimit> [liveUpdate]',
        'Upload a task',
        (yargs) => {
            yargs.positional('liveUpdate', { type: 'boolean', default: false })
        },
        (argv) => callFunctionAndPrint(wasmico.uploadTask, argv)
    )
    .command('start <deviceIP> <filename>', 'Start a task', {}, (argv) =>
        callFunctionAndPrint(wasmico.startTask, argv)
    )
    .command('stop <deviceIP> <filename>', 'Stop a task', {}, (argv) =>
        callFunctionAndPrint(wasmico.stopTask, argv)
    )
    .command('pause <deviceIP> <filename>', 'Pause a task', {}, (argv) =>
        callFunctionAndPrint(wasmico.pauseTask, argv)
    )
    .command('resume <deviceIP> <filename>', 'Resume a task', {}, (argv) =>
        callFunctionAndPrint(wasmico.resumeTask, argv)
    )
    .command('showactive <deviceIP>', 'Show active tasks', {}, (argv) =>
        callFunctionAndPrint(wasmico.getActiveTaskDetails, argv)
    )
    .command('details <deviceIP>', 'Show details from tasks', {}, (argv) =>
        callFunctionAndPrint(wasmico.getTaskDetails, argv)
    )
    .command(
        'state <deviceIP> <filename> [stateFile]',
        'Get task state',
        {},
        async (argv) => {
            if (argv.stateFile) {
                const path = argv.stateFile
                await wasmico
                    .getTaskState(argv)
                    .then((response) => {
                        writeFileSync(path, JSON.stringify(response))
                    })
                    .catch((response) => {
                        console.log(response)
                    })
            } else {
                callFunctionAndPrint(wasmico.getTaskState, argv)
            }
        }
    )
    .command(
        'uploadState <deviceIP> <filename> [stateFile]',
        'Upload state ',
        {},
        (argv) => {
            const path = argv.stateFile
            argv.state = readFileSync(path)
            callFunctionAndPrint(wasmico.uploadTaskState, argv)
        }
    )
    .command('heap <deviceIP>', 'Show free heap size', {}, (argv) =>
        callFunctionAndPrint(wasmico.getFreeHeapSize, argv)
    )
    .demandCommand(1)
    .strict().argv
