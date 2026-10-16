#!/usr/bin/env node
import { main } from "./main";
import { run } from "./run";

// Not awaited: Bun's --bytecode compile doesn't allow top-level await.
// run() handles its own errors.
void run(main);
