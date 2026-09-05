const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Checks if a student with given batchYear is eligible to be an ALUMNI
 * on the specified targetDate.
 *
 * Business Rule:
 * - All courses are 3-year courses.
 * - batchYear represents academic session start year.
 * - graduationYear = batchYear + 3
 * - conversionDate = August 1 of graduationYear.
 *
 * @param {number|string} batchYear - Academic session start year (e.g., 2024)
 * @param {Date|string} [targetDate=new Date()] - Simulated or current date
 * @returns {boolean} - True if targetDate is on or after August 1 of graduationYear
 */
function isEligibleForAlumni(batchYear, targetDate = new Date()) {
  const parsedBatch = typeof batchYear === 'string' ? parseInt(batchYear, 10) : batchYear;
  if (!parsedBatch || typeof parsedBatch !== 'number' || isNaN(parsedBatch)) {
    return false;
  }

  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid target date provided: ${targetDate}`);
  }

  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth(); // 0 = Jan ... 7 = Aug ... 11 = Dec
  const targetDay = date.getDate();

  const graduationYear = parsedBatch + 3;

  // If the target year is strictly after the graduation year, student is already an alumnus
  if (targetYear > graduationYear) {
    return true;
  }

  // If we are in the graduation year, check if we have reached or passed August 1
  if (targetYear === graduationYear) {
    if (targetMonth > 7) {
      return true; // September - December
    }
    if (targetMonth === 7 && targetDay >= 1) {
      return true; // August 1 onwards
    }
  }

  return false;
}

/**
 * Promotes all eligible STUDENT users to ALUMNI based on their batchYear
 * and the provided targetDate.
 *
 * Properties:
 * - Safe & idempotent: Running multiple times causes no unintended mutations.
 * - Non-destructive: Only updates role from 'STUDENT' to 'ALUMNI'.
 * - Preserves ADMIN and ALUMNI accounts without modifications.
 * - Skips students with missing or invalid batchYear safely.
 *
 * @param {Date|string} [targetDate=new Date()] - Date to evaluate against
 * @param {PrismaClient} [customPrismaClient=prisma] - Optional prisma client for DI / testing
 * @returns {Promise<{
 *   success: boolean,
 *   targetDate: string,
 *   scannedCount: number,
 *   eligibleCount: number,
 *   promotedCount: number,
 *   skippedCount: number,
 *   promotedUsers: Array<{ id: string, name: string, email: string, batchYear: number }>,
 *   skippedUsers: Array<{ id: string, name: string, email: string, reason: string }>
 * }>}
 */
async function promoteEligibleStudents(targetDate = new Date(), customPrismaClient = prisma) {
  const db = customPrismaClient || prisma;
  const date = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid target date: ${targetDate}`);
  }

  const targetDateStr = date.toISOString().split('T')[0];
  console.log(`[GraduationService] Alumni promotion job started for date: ${targetDateStr}`);

  // Fetch only active users with role 'STUDENT'
  const students = await db.user.findMany({
    where: {
      role: 'STUDENT',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      alumniProfile: {
        select: {
          batchYear: true,
          department: true,
        },
      },
    },
  });

  const promotedUsers = [];
  const skippedUsers = [];
  const eligibleIds = [];

  for (const student of students) {
    const batchYear = student.alumniProfile?.batchYear;

    if (!batchYear || isNaN(batchYear)) {
      skippedUsers.push({
        id: student.id,
        name: student.name,
        email: student.email,
        reason: 'Missing or invalid batchYear in alumni profile',
      });
      continue;
    }

    if (isEligibleForAlumni(batchYear, date)) {
      eligibleIds.push(student.id);
      promotedUsers.push({
        id: student.id,
        name: student.name,
        email: student.email,
        batchYear,
      });
    }
  }

  let promotedCount = 0;
  if (eligibleIds.length > 0) {
    const updateResult = await db.user.updateMany({
      where: {
        id: { in: eligibleIds },
        role: 'STUDENT', // Double-safety guard: only update if currently STUDENT
      },
      data: {
        role: 'ALUMNI',
      },
    });
    promotedCount = updateResult.count;
  }

  console.log(`[GraduationService] Promoted ${promotedCount} students to ALUMNI.`);
  console.log(`[GraduationService] Alumni promotion job completed.`);

  return {
    success: true,
    targetDate: targetDateStr,
    scannedCount: students.length,
    eligibleCount: eligibleIds.length,
    promotedCount,
    skippedCount: skippedUsers.length,
    promotedUsers,
    skippedUsers,
  };
}

module.exports = {
  isEligibleForAlumni,
  promoteEligibleStudents,
};
