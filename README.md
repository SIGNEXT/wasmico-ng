# Wasmico

The contents of this repository have been developed with the intent of facilitating the working experience of developers while using Wasmico. All the code contained within this folder is intended to be utilized in conjunction with the Wasmico [tool](tool/) that should be running on ESP32 devices.

## Installation

To install this module, you must have nodejs and a package manager. In this example, I'll be using npm.

`npm install -g wasmico`

By installing this package, you will be able to use the `@wasmico/core` in your JavaScript or TypeScript code and the `@wasmico/cli` and `@wasmico/tui` commands.

## Usage

### @wasmico/core

The essential code to use your device as a central server to control your @wasmico/running ESP32s is contained in the `@wasmico/core` package.

This module is made to be easily incorporated into your code and allows you to easily send commands to ESP32 devices.

Please read the available [Core README](./core/README.md) for further information.

### @wasmico/cli

The `@wasmico/cli` package can be used as an executable. It allows you to execute commands on the ESP32 via the command line.

All the available commands and how to use them can be found in the [CLI README](./cli/README.md)

### @wasmico/tui

The `@wasmico/tui` package is also used as an executable which gives you the option to keep track of the available ESP32 devices while sending commands.

This tool is described in the [TUI README](./tui/README.md)