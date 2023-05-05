# Wasmico

The contents of this repository have been developed with the intent of facilitating the working experience of developers while using Wasmico. All the code contained within this folder is intended to be utilized in conjunction with the Wasmico [tool](tool/) that should be running on ESP32 devices.

## Installation

To install this module, you must have nodejs and a package manager. In this example, I'll be using npm.

`npm install -g wasmico`

By installing this package, you will be able to use the `wasmico` in your JavaScript or TypeScript code and the `wasmico-cli` and `wasmico-tui` commands.

## Usage

### Wasmico core

The essential code to use your device as a central server to control your Wasmico running ESP32s is contained in the `core` folder.

This module is made to be easily incorporated into your code and allows you to easily send commands to ESP32 devices.

All the available commands and how to use them can be found in the [Core README](./core/README.md).

### Wasmico cli

The `wasmico-cli` is an executable that allows you to execute commands on the ESP32 via the command line.

Please read the [CLI README](./cli/README.md) for further information.

### Wasmico tui

The `wasmico-tui` is also an executable that gives you the option to keep track of the available ESP32 devices while sending commands.

This tool is described in the [TUI README](./tui/README.md).