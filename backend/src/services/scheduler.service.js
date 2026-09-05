const cron = require('node-cron');
const { promoteEligibleStudents } = require('./graduation.service');

let graduationJob = null;

/**
 * Initializes the background scheduled jobs.
 * Runs daily at midnight (00:00).
 */
function initSchedulers() {
  if (graduationJob) {
    console.log('[Scheduler] Schedulers already running.');
    return;
  }

  // Schedule daily run at 00:00 (midnight)
  graduationJob = cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Scheduler] Running scheduled daily graduation conversion job...');
      await promoteEligibleStudents();
    } catch (error) {
      console.error('[Scheduler] Error during scheduled graduation conversion:', error.message);
    }
  });

  console.log('[Scheduler] Daily graduation conversion job initialized (runs at 00:00 daily).');
}

/**
 * Cleanly stops all active scheduled jobs.
 */
function stopSchedulers() {
  if (graduationJob) {
    graduationJob.stop();
    graduationJob = null;
    console.log('[Scheduler] Schedulers stopped.');
  }
}

module.exports = {
  initSchedulers,
  stopSchedulers,
};
