import { resetWeeklyFreeWashes } from "./models/User.js";

async function run() {
  try {
    await resetWeeklyFreeWashes(7);
    console.log("✅ Đã reset free_washes_left = 7 cho tất cả users");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi reset lượt giặt:", err);
    process.exit(1);
  }
}

run();