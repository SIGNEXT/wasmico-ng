import { readFileSync, writeFileSync, appendFileSync } from 'fs'

const DEVICES_FILENAME = '/devices.txt'

const isValidIPAddress = (ipAddress) => {
    const regexExp =
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi
    return regexExp.test(ipAddress)
}

const readDevicesToMap = () => {
    const map = new Map()
    const entries = readFileSync(__dirname + DEVICES_FILENAME, {
        encoding: 'utf8',
        flag: 'r',
    }).split('\n')
    for (const entry of entries) {
        if (entry == '') continue
        let [deviceName, deviceIP, groupName] = entry.split(' ')
        if (!groupName) {
            groupName = 'default'
        }
        map.set(deviceName, {
            deviceIP,
            groupName,
        })
    }
    return map
}

const writeDevicesToFile = (map) => {
    writeFileSync(__dirname + DEVICES_FILENAME, '') // clear file
    for (const [deviceName, { deviceIP, groupName }] of map) {
        appendFileSync(
            __dirname + DEVICES_FILENAME,
            `${deviceName} ${deviceIP} ${groupName}\n`
        )
    }
}

const sleep = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

export default {
    sleep,
    writeDevicesToFile,
    readDevicesToMap,
    isValidIPAddress,
}
