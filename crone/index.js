import cleanupUnverifiedUsers from "./cleanupUnverifiedUsers.js";

const initCrons = () => {
  cleanupUnverifiedUsers();
};

export default initCrons;
