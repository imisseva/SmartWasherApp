#!/usr/bin/env node
// One-off script to run the weekly reset manually for testing.
// Usage: node scripts/run-reset.js [defaultWashes]

import { resetWeeklyFreeWashes } from "../models/User.js";

const arg = process.argv[2];
const defaultWashes = Number(arg ?? 7);

(async () => {
  try {
    console.log(`Running manual reset: set free_washes_left = ${defaultWashes} for all users...`);
    const affected = await resetWeeklyFreeWashes(defaultWashes);
    console.log(`✅ Done — affected rows: ${affected}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error running manual reset:', err);
    process.exit(1);
  }
})();
