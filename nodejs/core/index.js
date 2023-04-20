import Evilscan from 'evilscan'
import utils from './utils.js'
import { existsSync, createReadStream } from 'fs'

const checkFilename = (filename) => {
    if (!filename) {
        throw {
            status_code: 1,
            message: 'Need to specify filename!',
        }
    }
}

const checkDeviceIP = (deviceIP) => {
    if (!deviceIP) {
        throw {
            status_code: 1,
            message: 'No device was selected!',
        }
    }
    if (!utils.isValidIPAddress(deviceIP)) {
        throw {
            status_code: 1,
            message: 'IP ' + deviceIP + ' is not valid!',
        }
    }
}

const uploadTask = async ({
    deviceIP,
    filename,
    reservedStackSize,
    reservedInitialMemory,
    memoryLimit,
    liveUpdate,
}) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)
    const filepath = __dirname + `/../files/${filename}`
    if (!existsSync(filepath)) {
        throw {
            status_code: 1,
            message: 'the file ' + filepath + ' does not exist',
        }
    }
    const formData = {
        wasmfile: {
            value: createReadStream(filepath),
            options: {
                filename: filename,
                contentType: null,
            },
        },
    }
    if (reservedStackSize) formData['reservedStackSize'] = reservedStackSize
    if (reservedInitialMemory)
        formData['reservedInitialMemory'] = reservedInitialMemory
    if (memoryLimit) formData['memoryLimit'] = memoryLimit
    formData['liveUpdate'] = liveUpdate ? 'true' : 'false'

    return await utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/upload`,
        method: 'POST',
        args: formData,
    })
}

const deleteTask = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    return await utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/delete`,
        method: 'POST',
        args: {
            filename: filename,
        },
    })
}

const startTask = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/start`,
        method: 'POST',
        args: {
            filename: filename,
        },
    })
}

const stopTask = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/stop`,
        method: 'POST',
        args: {
            filename: filename,
        },
    })
}

const pauseTask = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/pause`,
        method: 'POST',
        args: {
            filename: filename,
        },
    })
}

const resumeTask = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/unpause`,
        method: 'POST',
        args: {
            filename: filename,
        },
    })
}

const getTaskDetails = async ({ deviceIP }) => {
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/details`,
        method: 'GET',
    })
}

const editTaskDetails = async ({
    deviceIP,
    filename,
    reservedStackSize,
    reservedInitialMemory,
    memoryLimit,
}) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)
    if (reservedStackSize) formData['reservedStackSize'] = reservedStackSize
    if (reservedInitialMemory)
        formData['reservedInitialMemory'] = reservedInitialMemory
    if (memoryLimit) formData['memoryLimit'] = memoryLimit

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/edit`,
        method: 'POST',
        args: params,
    })
}

const getTaskState = async ({ deviceIP, filename }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)
    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/state`,
        method: 'GET',
        args: {
            filename: filename,
        },
    })
}

const uploadTaskState = async ({ deviceIP, filename, state }) => {
    checkFilename(filename)
    checkDeviceIP(deviceIP)

    state = JSON.parse(state)
    if (!state.data || !state.len) {
        console.log("State file doesn't have correct format.")
    }
    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/state`,
        method: 'POST',
        args: {
            filename: filename,
            state: state.data,
            len: state.len,
        },
    })
}

const getActiveTaskDetails = async ({ deviceIP }) => {
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/task/active`,
        method: 'GET',
    })
}

const getFreeHeapSize = async ({ deviceIP }) => {
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/heap`,
        method: 'GET',
    })
}

const restartDevice = async ({ deviceIP }) => {
    checkDeviceIP(deviceIP)

    return utils.sendRequestToDevice({
        url: `http://${deviceIP}/restart`,
        method: 'POST',
    })
}

const scanNetwork = async (network) => {
    const foundDevices = []
    let done = false
    const evilScanOptions = {
        target: network,
        port: '80',
        status: 'OU',
        banner: true,
    }
    const evilscan = new Evilscan(evilScanOptions)

    evilscan.on('result', async (data) => {
        await getActiveTaskDetails({ deviceIP: data.ip })
            .then((response) => {
                if (response.status_code === 0) {
                    foundDevices.push(data.ip)
                }
            })
            .catch(() => {})
    })

    evilscan.on('done', () => {
        done = true
    })
    evilscan.run()
    while (!done) {
        await utils.sleep(1000)
    }
    return foundDevices
}

export default {
    uploadTask,
    deleteTask,
    startTask,
    stopTask,
    pauseTask,
    resumeTask,
    getTaskDetails,
    editTaskDetails,
    getTaskState,
    uploadTaskState,
    getActiveTaskDetails,
    getFreeHeapSize,
    restartDevice,
    scanNetwork,
}
