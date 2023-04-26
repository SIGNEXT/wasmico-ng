import wasmico from 'wasmico-core'
import inquirer from 'inquirer'
import { readFileSync, writeFileSync } from 'fs'
import utils from './utils.js'
import { updateDevices } from './index.js'

const checkboxOnDevicesAndGroups = (
    devices,
    message = 'Device name',
    name = 'names'
) => {
    const choices = devices
        .filter((device) => device.status)
        .map((device) => device.name)
        .concat([...new Set(devices.map((device) => 'Group: ' + device.group))])
    return {
        type: 'checkbox',
        name: name,
        message: message,
        choices: choices,
    }
}
const getChosenDevices = (devices, names) => {
    const devicesNames = new Set()
    names.forEach((name) => {
        if (name.startsWith('Group: ')) {
            const groupName = name.substr(7)
            devices.forEach((device) => {
                if (device.group === groupName) {
                    devicesNames.add(device.name)
                }
            })
        } else {
            devicesNames.add(name)
        }
    })
    return [...devicesNames]
}
const getRunningTasks = (chosenDevices) => {
    const runningTasks = new Set()
    chosenDevices.forEach((chosenDevice) => {
        devices
            .find((device) => device.name === chosenDevice)
            .runningTasks.forEach((task) => {
                runningTasks.add(task)
            })
    })
    return [...runningTasks]
}

async function addDevicePrompt() {
    let answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Device name',
        },
        {
            type: 'input',
            name: 'ip',
            message: 'Device IP',
            validate: (input) => utils.isValidIPAddress(input),
        },
        {
            type: 'input',
            name: 'group',
            message: 'Device Group',
            default: 'default',
        },
    ])
    const deviceIndex = devices.findIndex((device) => device.ip === answers.ip)
    if (deviceIndex === -1) {
        devices.push({
            name: answers.name,
            ip: answers.ip,
            group: answers.group,
            status: false,
            permanent: true,
            runningTasks: 0,
            freeSpace: 0,
        })
    } else {
        devices[deviceIndex].name = answers.name
        devices[deviceIndex].permanent = true
        devices[deviceIndex].group = answers.group
    }
    const devicesMap = new Map()
    devices
        .filter((device) => device.permanent)
        .forEach((device) => {
            devicesMap.set(device.name, {
                deviceIP: device.ip,
                groupName: device.group,
            })
        })
    utils.writeDevicesToFile(devicesMap)
}

async function removeDevicePrompt() {
    let answers = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'names',
            message: 'Device name',
            choices: devices.map((device) => device.name),
        },
    ])
    answers.names.forEach((deviceName) => {
        devices = devices.filter((device) => device.name !== deviceName)
    })
}

async function scanNetworkPrompt() {
    let answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'network',
            message: 'Network IP address subnet',
            default: network,
        },
    ])

    const foundDevices = await wasmico.scanNetwork(answers.network)
    foundDevices
        .filter((deviceIP) => !devices.find((device) => device.ip === deviceIP))
        .forEach((deviceIP) => {
            devices.push({
                name: deviceIP,
                ip: deviceIP,
                group: 'default',
                status: true,
                permanent: false,
                runningTasks: [],
                freeSpace: 0,
            })
        })
    updateDevices()
}

async function uploadTaskPrompt() {
    let answers = await inquirer.prompt([
        checkboxOnDevicesAndGroups(devices),
        {
            type: 'input',
            name: 'filepath',
            message: 'File path',
        },
        {
            type: 'number',
            name: 'reservedStackSize',
            message: 'Reserved stack size',
            default: 10000,
        },
        {
            type: 'number',
            name: 'reservedInitialMemory',
            message: 'Reserved initial memory',
            default: 65536,
        },
        {
            type: 'number',
            name: 'memoryLimit',
            message: 'Memory limit',
            default: 4096,
        },
        {
            type: 'confirm',
            name: 'liveUpdate',
            message: 'Live Update',
            default: false,
        },
    ])

    await Promise.all(
        getChosenDevices(devices, answers.names).map(async (deviceName) => {
            await wasmico
                .uploadTask({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filepath: answers.filepath,
                    reservedStackSize: answers.reservedStackSize,
                    reservedInitialMemory: answers.reservedInitialMemory,
                    memoryLimit: answers.memoryLimit,
                    liveUpdate: answers.liveUpdate,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function startTaskPrompt() {
    let answers = await inquirer.prompt([
        checkboxOnDevicesAndGroups(devices),
        {
            type: 'input',
            name: 'filename',
            message: 'File name',
        },
    ])
    await Promise.all(
        getChosenDevices(devices, answers.names).map(async (deviceName) => {
            await wasmico
                .startTask({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filename: answers.filename,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function stopTaskPrompt() {
    let answers = await inquirer.prompt([checkboxOnDevicesAndGroups(devices)])
    const chosenDevices = getChosenDevices(devices, answers.names)
    const runningTasks = getRunningTasks(chosenDevices)
    if (runningTasks.length === 0) {
        console.log('Chosen devices have no running tasks')
        return
    }

    answers = await inquirer.prompt(
        [
            {
                type: 'list',
                name: 'filename',
                message: 'Running Tasks',
                choices: runningTasks,
            },
        ],
        answers
    )
    await Promise.all(
        chosenDevices.map(async (deviceName) => {
            await wasmico
                .stopTask({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filename: answers.filename,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function pauseTaskPrompt() {
    let answers = await inquirer.prompt([checkboxOnDevicesAndGroups(devices)])
    const chosenDevices = getChosenDevices(devices, answers.names)
    const runningTasks = getRunningTasks(chosenDevices)
    if (runningTasks.length === 0) {
        console.log('Chosen devices have no running tasks')
        return
    }

    answers = await inquirer.prompt(
        [
            {
                type: 'list',
                name: 'filename',
                message: 'Running Tasks',
                choices: runningTasks,
            },
        ],
        answers
    )
    await Promise.all(
        chosenDevices.map(async (deviceName) => {
            await wasmico
                .pauseTask({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filename: answers.filename,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function resumeTaskPrompt() {
    let answers = await inquirer.prompt([checkboxOnDevicesAndGroups(devices)])
    const chosenDevices = getChosenDevices(devices, answers.names)
    const runningTasks = getRunningTasks(chosenDevices)
    if (runningTasks.length === 0) {
        console.log('Chosen devices have no running tasks')
        return
    }

    answers = await inquirer.prompt(
        [
            {
                type: 'list',
                name: 'filename',
                message: 'Running Tasks',
                choices: runningTasks,
            },
        ],
        answers
    )
    await Promise.all(
        chosenDevices.map(async (deviceName) => {
            await wasmico
                .resumeTask({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filename: answers.filename,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function saveTaskStatePrompt() {
    let answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: 'Device name',
            choices: devices
                .filter((device) => device.status)
                .map((device) => device.name),
        },
    ])
    const runningTasks = getRunningTasks([answers.name])
    if (runningTasks.length === 0) {
        console.log('Chosen device has no running tasks')
        return
    }

    answers = await inquirer.prompt(
        [
            {
                type: 'list',
                name: 'filename',
                message: 'Running Tasks',
                choices: runningTasks,
            },
            {
                type: 'input',
                name: 'stateFilename',
                message: 'State file name',
            },
        ],
        answers
    )
    await wasmico
        .getTaskState({
            deviceIP: devices.find((device) => device.name === answers.name).ip,
            filename: answers.filename,
        })
        .then((response) => {
            const path = answers.stateFilename
            writeFileSync(path, JSON.stringify(response))
        })
        .catch((response) => {
            console.log(answers.name + ': ' + response.message)
        })
}

async function uploadTaskStatePrompt() {
    let answers = await inquirer.prompt([
        checkboxOnDevicesAndGroups(devices),
        {
            type: 'input',
            name: 'filename',
            message: 'File name',
        },
        {
            type: 'input',
            name: 'stateFilename',
            message: 'State file name',
        },
    ])

    await Promise.all(
        getChosenDevices(devices, answers.names).map(async (deviceName) => {
            const path = answers.stateFilename
            const state = readFileSync(path)
            await wasmico
                .uploadTaskState({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                    filename: answers.filename,
                    state: state,
                })
                .then((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
                .catch((response) => {
                    console.log(deviceName + ': ' + response.message)
                })
        })
    )
}

async function migrateTaskStatePrompt() {
    let answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'from',
            message: 'Device to migrate from',
            choices: devices
                .filter((device) => device.status)
                .map((device) => device.name),
        },
    ])
    const runningTasks = getRunningTasks([answers.from])
    if (runningTasks.length === 0) {
        console.log('Chosen device has no running tasks')
        return
    }

    answers = await inquirer.prompt(
        [
            checkboxOnDevicesAndGroups(devices, 'Devices to migrate to', 'to'),
            {
                type: 'list',
                name: 'filename',
                message: 'Running Tasks',
                choices: runningTasks,
            },
        ],
        answers
    )

    await wasmico
        .getTaskState({
            deviceIP: devices.find((device) => device.name === answers.from).ip,
            filename: answers.filename,
        })
        .then(async (response) => {
            await Promise.all(
                getChosenDevices(devices, answers.to).map(
                    async (deviceName) => {
                        const state = JSON.stringify(response)
                        await wasmico
                            .uploadTaskState({
                                deviceIP: devices.find(
                                    (device) => device.name === deviceName
                                ).ip,
                                filename: answers.filename,
                                state: state,
                            })
                            .then((response) => {
                                console.log(
                                    deviceName + ': ' + response.message
                                )
                            })
                            .catch((response) => {
                                console.log(
                                    deviceName + ': ' + response.message
                                )
                            })
                    }
                )
            )
        })
        .catch((response) => {
            console.log(answers.from + ': ' + response.message)
        })
}

async function restartDevicePrompt() {
    let answers = await inquirer.prompt([
        checkboxOnDevicesAndGroups(devices),
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Confirm restart',
            default: false,
        },
    ])
    if (answers.confirm) {
        await Promise.all(
            getChosenDevices(devices, answers.names).map(async (deviceName) => {
                await wasmico.restartDevice({
                    deviceIP: devices.find(
                        (device) => device.name === deviceName
                    ).ip,
                })
            })
        )
    }
}

export default {
    addDevicePrompt,
    removeDevicePrompt,
    scanNetworkPrompt,
    uploadTaskPrompt,
    startTaskPrompt,
    stopTaskPrompt,
    pauseTaskPrompt,
    resumeTaskPrompt,
    saveTaskStatePrompt,
    uploadTaskStatePrompt,
    migrateTaskStatePrompt,
    restartDevicePrompt,
}
