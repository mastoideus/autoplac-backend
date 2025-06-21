import { cleanupUnverifiedUsers } from "../utils/cleanup.js";
import cron from "node-cron";

export default () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("deleting unverified users (cron)");
    await cleanupUnverifiedUsers();
  });
};
