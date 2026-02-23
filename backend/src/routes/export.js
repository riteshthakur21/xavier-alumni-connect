// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const { Parser } = require('json2csv'); 
// const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// const router = express.Router();
// const prisma = new PrismaClient();

// // Export Alumni Report with Work & Location Details 📊
// router.get('/alumni', authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { filter } = req.query; // 'all' ya 'verified'

//     const whereCondition = {};
//     if (filter === 'verified') {
//       whereCondition.isVerified = true;
//     }

//     // 1. Database se saara data nikalna
//     const users = await prisma.user.findMany({
//       where: whereCondition,
//       include: { 
//         alumniProfile: true // Profile details include karna zaroori hai
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     if (users.length === 0) {
//       return res.status(404).json({ error: 'No data found to export' });
//     }

//     // 2. Data ko Table ke columns mein map karna (Jaisa tumne maanga)
//     const dataForCsv = users.map(u => ({
//       'Name': u.name,
//       'Roll No': u.rollNo || 'N/A', //
//       'Dept': u.alumniProfile?.department || 'N/A',
//       'Batch': u.alumniProfile?.batchYear || 'N/A',
//       'Location': u.alumniProfile?.location || 'Not Specified', // 📍 Location
//       'Current Work': u.alumniProfile?.jobTitle || 'N/A', // 💼 Work details
//       'Company': u.alumniProfile?.company || 'N/A',
//       'Email': u.email,
//       'Role': u.role,
//       'Status': u.isVerified ? 'Verified' : 'Pending'
//     }));

//     // 3. CSV Columns define karna
//     const fields = [
//       'Name', 
//       'Roll No', 
//       'Dept', 
//       'Batch', 
//       'Location', 
//       'Current Work', 
//       'Company', 
//       'Email', 
//       'Role', 
//       'Status'
//     ];
    
//     const json2csvParser = new Parser({ fields });
//     const csv = json2csvParser.parse(dataForCsv);

//     // 4. Response bhejna
//     res.header('Content-Type', 'text/csv');
//     res.attachment(`Xavier_Alumni_Report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
//     return res.send(csv);

//   } catch (error) {
//     console.error('Export Error:', error);
//     res.status(500).json({ error: 'Failed to generate report' });
//   }
// });

// module.exports = router;

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv'); 
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Advanced Export Route 📊
router.get('/alumni', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 👇 Destructuring filters (Company hat gaya, Department add hua)
    const { type, batchYear, department } = req.query; 

    let whereCondition = {};
    
    // 1. Role-based base filter
    if (type === 'verified_student') {
      whereCondition = { role: 'STUDENT', isVerified: true };
    } else if (type === 'verified_alumni') {
      whereCondition = { role: 'ALUMNI', isVerified: true };
    }

    // 2. Advanced Filters logic (Batch & Dept)
    if (batchYear || department) {
      // Ensure alumniProfile object exists in where clause
      whereCondition.alumniProfile = { ...whereCondition.alumniProfile };
      
      if (batchYear) {
        whereCondition.alumniProfile.batchYear = parseInt(batchYear);
      }
      
      if (department) {
        // Strict match for dropdown values (BCA, BBA, etc.)
        whereCondition.alumniProfile.department = department; 
      }
    }

    // Database query execution
    const users = await prisma.user.findMany({
      where: whereCondition,
      include: { alumniProfile: true },
      orderBy: { name: 'asc' }
    });

    // 🕵️‍♂️ Empty Data Check: Agar filters ke baad koi user nahi mila
    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'No records found for this combination! 🔍',
        message: 'This combination of users is not available in our database! ' 
      });
    }
    

    // 3. Dynamic Column Logic
    const dataForCsv = users.map(u => {
      // Basic common fields
      const row = {
        'Name': u.name,
        'Roll No': u.rollNo || 'N/A',
        'Dept': u.alumniProfile?.department || 'N/A',
        'Batch': u.alumniProfile?.batchYear || 'N/A',
        'Email': u.email,
        'Location': u.alumniProfile?.location || 'N/A',
        'Role': u.role,
        //'linkedin': u.alumniProfile?.linkedinUrl || 'N/A',
      };

      // Work details: Only for non-student reports
      if (type !== 'verified_student') {
        row['Current Work'] = u.alumniProfile?.jobTitle || 'N/A';
        row['Company'] = u.alumniProfile?.company || 'N/A';
      }

      // Status: Only for 'All' database report
      if (type === 'all') {
        row['Status'] = u.isVerified ? 'Verified' : 'Pending';
      }
      
      return row;
    });

    // 4. Generate & Send CSV
    const parser = new Parser();
    const csv = parser.parse(dataForCsv);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Xavier_Export_${type}_${new Date().toLocaleDateString()}.csv`);
    return res.send(csv);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;