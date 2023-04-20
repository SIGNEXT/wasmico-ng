import Table from 'cli-table3'
import inquirer from 'inquirer'
import InterruptedPrompt from 'inquirer-interrupted-prompt'
import prompts from './prompts.js'
import { updateDevices } from './index.js'

InterruptedPrompt.fromAll(inquirer)

function displayDevicesInfo(devices) {
    if (!devices) {
        console.log('No devices were configured yet')
        return
    }
    const table = new Table({
        head: ['Name', 'Group', 'IP', 'Status', 'Running Tasks', 'Free Space'],
    })
    devices.forEach((device) => {
        table.push([
            device.name,
            device.group,
            device.ip,
            device.status ? 'on' : 'off',
            device.status ? device.runningTasks.length : '',
            device.status ? device.freeSpace : '',
        ])
    })
    console.log(table.toString())
}

async function showMenu() {
    const answers = await inquirer.prompt({
        type: 'list',
        name: 'option',
        message: 'Choose an option',
        choices: [
            'Add/Rename device',
            'Remove a device',
            'Scan network',
            'Upload file',
            'Start task',
            'Stop task',
            'Pause task',
            'Resume task',
            'Save task state',
            'Upload task state',
            'Migrate task state',
            'Restart device',
            'Refresh devices',
        ],
        pageSize: 10000,
    })
    switch (answers.option) {
        case 'Add/Rename device':
            await prompts.addDevicePrompt()
            break
        case 'Remove a device':
            await prompts.removeDevicePrompt()
            break
        case 'Scan network':
            await prompts.scanNetworkPrompt()
            break
        case 'Upload file':
            await prompts.uploadFilePrompt()
            break
        case 'Start task':
            await prompts.startTaskPrompt()
            break
        case 'Stop task':
            await prompts.stopTaskPrompt()
            break
        case 'Pause task':
            await prompts.pauseTaskPrompt()
            break
        case 'Resume task':
            await prompts.resumeTaskPrompt()
            break
        case 'Save task state':
            await prompts.saveTaskStatePrompt()
            break
        case 'Upload task state':
            await prompts.uploadTaskStatePrompt()
            break
        case 'Migrate task state':
            await prompts.migrateTaskStatePrompt()
            break
        case 'Restart device':
            await prompts.restartDevicePrompt()
            break
        case 'Refresh devices':
            await updateDevices()
            break
        default:
            console.log('Option not implemented')
            break
    }
}

export default {
    displayDevicesInfo,
    showMenu,
}
