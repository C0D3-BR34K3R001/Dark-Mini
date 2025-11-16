const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");

const SESSION_DIR = path.resolve(__dirname, "./GV_Session");

class SessionManager {
  static async ensureSessionDir() {
    try {
      await fs.mkdir(SESSION_DIR, { recursive: true });
      return true;
    } catch (error) {
      console.error(chalk.red("Failed to create session directory:"), error);
      return false;
    }
  }

  static async isValidSession() {
    try {
      const files = await fs.readdir(SESSION_DIR);
      // Valid session needs more than just creds.json
      return files.length > 1 && files.includes("creds.json");
    } catch (error) {
      return false;
    }
  }

  static async clearSession() {
    try {
      await fs.rm(SESSION_DIR, { force: true, recursive: true });
      console.log(chalk.greenBright("Session cleared successfully"));
      return true;
    } catch (error) {
      console.error(chalk.red("Failed to clear session:"), error);
      return false;
    }
  }

  static async getSessionStatus() {
    try {
      const exists = await fs
        .access(SESSION_DIR)
        .then(() => true)
        .catch(() => false);

      if (!exists) return "no_session";

      const files = await fs.readdir(SESSION_DIR);

      if (files.length === 0) return "empty";
      if (files.length === 1 && files.includes("creds.json"))
        return "invalid_creds";
      return "valid";
    } catch (error) {
      return "error";
    }
  }
}

module.exports = SessionManager;
