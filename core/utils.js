import axios from 'axios'

const isValidIPAddress = (ipAddress) => {
    const regexExp =
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi
    return regexExp.test(ipAddress)
}
const sendRequestToDevice = async ({ url, method, args, timeout }) => {
    const reqObj = {
        method: method,
        url: url,
        timeout: timeout ?? 5000,
        headers: {},
    }
    if (method == 'GET' && args) {
        reqObj['params'] = args
    }
    if (method == 'POST' && args) {
        reqObj['data'] = args
        reqObj['headers'] = {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        }
    }
    const response = await axios(reqObj).catch((error) => {
        if (error.response && error.response.data) {
            throw error.response.data
        }
        throw {
            status_code: 1,
            message: "Couldn't connect to device",
        }
    })
    return response.data
}

const sleep = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

export default {
    sleep,
    sendRequestToDevice,
    isValidIPAddress,
}
