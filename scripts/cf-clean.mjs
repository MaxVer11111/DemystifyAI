// Clean .open-next directory for a fresh Cloudflare build.
// On Windows the directory often gets locked by previous wrangler processes.

import { rmSync, existsSync } from "fs";
import { execSync } from "child_process";

// Kill any lingering wrangler processes
try {
  execSync("taskkill /f /fi \"WINDOWTITLE eq wrangler*\" 2>nul", {
    windowsHide: true,
    stdio: "ignore",
  });
} catch {
  // none running
}

// Remove the build output directory
const dir = ".open-next";
if (existsSync(dir)) {
  // Retry up to 3 times with delay (Windows lock release)
  for (let i = 0; i < 3; i++) {
    try {
      rmSync(dir, { recursive: true, force: true });
      console.log(`cleaned ${dir}`);
      break;
    } catch (err) {
      if (i === 2) {
        console.error(`failed to clean ${dir}:`, err.message);
        process.exit(1);
      }
      execSync("timeout /t 2 /nobreak >nul", { stdio: "ignore" });
    }
  }
}
