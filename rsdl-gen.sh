#!/usr/bin/env bash

rsdl -t rust -i protocol.rsdl -o src-tauri/src/protocol_inc.rs
rsdl -t typescript -i protocol.rsdl -o src/protocol.ts
