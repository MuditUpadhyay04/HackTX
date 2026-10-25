/**
 * Launches Chromium for the scripts: Playwright's bundled browser when it is installed
 * (`npx playwright install chromium`), otherwise the local Google Chrome (channel "chrome").
 * PW_CHANNEL=chrome forces Chrome.
 */
import { chromium, type Browser, type LaunchOptions } from "@playwright/test";

export async function launchBrowser(options: LaunchOptions = {}): Promise<Browser> {
  if (process.env.PW_CHANNEL) return chromium.launch({ ...options, channel: process.env.PW_CHANNEL });
  try {
    return await chromium.launch(options);
  } catch (error) {
    if (!String(error).includes("Executable doesn't exist")) throw error;
    console.log("bundled Chromium not installed; using the local Chrome (channel chrome)");
    return chromium.launch({ ...options, channel: "chrome" });
  }
}
