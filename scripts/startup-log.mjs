import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
export const STARTUP_LOG_PATH = path.join(root, "logs", "startup.log");

export function startupLog(message, error) {
  const detail =
    error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : error ? String(error) : "";
  const line = `${new Date().toISOString()} ${message}${detail ? `\n${detail}` : ""}\n`;

  try {
    fs.mkdirSync(path.dirname(STARTUP_LOG_PATH), { recursive: true });
    fs.appendFileSync(STARTUP_LOG_PATH, line);
  } catch {
    // ignore file write errors on read-only hosts
  }

  if (error) {
    console.error(message, error);
  } else {
    console.log(message);
  }
}

export function readStartupLog() {
  try {
    if (!fs.existsSync(STARTUP_LOG_PATH)) {
      return "No startup log yet. Redeploy the app, then refresh this page.";
    }
    const text = fs.readFileSync(STARTUP_LOG_PATH, "utf8");
    return text.slice(-12000);
  } catch (error) {
    return `Could not read startup log: ${error instanceof Error ? error.message : String(error)}`;
  }
}
