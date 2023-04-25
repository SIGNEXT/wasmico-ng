#! /usr/bin/env node

import utils from './utils.js'
import wasmico from 'wasmico-core'
import { get_active_interface } from 'network'
import { Netmask } from 'netmask'
import menus from './menus.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
global.__dirname = path.dirname(__filename)

global.network = '0.0.0.0/0'
global.devices = []
utils.readDevicesToMap().forEach((key, value) => {
    devices.push({
        name: value,
        ip: key.deviceIP,
        group: key.groupName,
        status: false,
        permanent: true,
        runningTasks: [],
        freeSpace: 0,
    })
})

export const updateDevices = async () => {
    await Promise.all(
        devices.map(async (device, idx) => {
            await wasmico
                .pingDevice({
                    deviceIP: device.ip,
                })
                .then(async () => {
                    await wasmico
                        .getActiveTaskDetails({
                            deviceIP: device.ip,
                        })
                        .then(async (response) => {
                            devices[idx].status = true
                            devices[idx].runningTasks = response.tasks.map(
                                (task) =>
                                    task.filename.substr(
                                        task.filename.lastIndexOf('/') + 1
                                    )
                            )
                        })
                        .catch(() => {
                            // If there's an error keep old data
                        })
                        .finally(async () => {
                            await wasmico
                                .getFreeHeapSize({
                                    deviceIP: device.ip,
                                })
                                .then((response) => {
                                    devices[idx].freeSpace =
                                        response.free_heap_size
                                })
                                .catch(() => {
                                    // If there's an error keep old data
                                })
                        })
                })
                .catch(() => {
                    devices[idx].status = false
                })
        })
    )
}

get_active_interface(async (err, obj) => {
    if (err) {
        return
    }
    const block = new Netmask(obj.ip_address, obj.netmask)
    network = block.base + '/' + block.bitmask
})
await updateDevices()
setInterval(updateDevices, 5000)
while (true) {
    menus.displayDevicesInfo(devices)
    console.log('\nPress <ESC> anytime to return to initial menu.\n')
    try {
        await menus.showMenu()
        await utils.sleep(1000)
    } catch (error) {
        if (error !== 'EVENT_INTERRUPTED') {
            console.log(error)
        }
        console.log('\n')
    }
    console.log('\n')
}
