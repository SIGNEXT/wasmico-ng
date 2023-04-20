#!/usr/bin/env bash

filename="example"

if [[ $# -eq 1 ]]
then
        filename=$1
fi

wasic++ -Os                                                   \
        -z stack-size=4096 -Wl,--initial-memory=65536         \
        -Wl,--max-memory=65536                                \
        -Wl,--allow-undefined-file=src.syms                   \
        -Wl,--strip-all -nostdlib                             \
        -o $filename.wasm $filename.cpp

wasm-opt -O3 $filename.wasm -o $filename.wasm
wasm-strip $filename.wasm

# xxd -i example.wasm > example.wasm.h