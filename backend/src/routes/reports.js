const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Export alumni data (admin only)
router.get('/export/alumni', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { format = 'csv', filter } = req.query;

    // Build where clause based on filter
    const where = { role: 'ALUMNI' };
    
    if (filter === 'verified') {
      where.isVerified = true;
    } else if (filter === 'pending') {
      where.isVerified = false;
    }

    const alumni = await prisma.user.findMany({
      where,
      include: {
        alumniProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'json') {
      res.json({ alumni });
      return;
    }

    // Prepare CSV data
    const csvData = alumni.map(user => ({
      'ID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Verified': user.isVerified ? 'Yes' : 'No',
      'Registration Date': user.createdAt.toISOString().split('T')[0],
      'Batch Year': user.alumniProfile?.batchYear || '',
      'Department': user.alumniProfile?.department || '',
      'Roll Number': user.alumniProfile?.rollNo || '',
      'Company': user.alumniProfile?.company || '',
      'Job Title': user.alumniProfile?.jobTitle || '',
      'Location': user.alumniProfile?.location || '',
      'LinkedIn URL': user.alumniProfile?.linkedinUrl || '',
      'Bio': user.alumniProfile?.bio || '',
      'Skills': user.alumniProfile?.skills?.join(', ') || '',
      'Profile Photo': user.alumniProfile?.photoUrl || ''
    }));

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `alumni-report-${timestamp}.csv`;
    const filepath = path.join(reportsDir, filename);

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'ID', title: 'ID' },
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Role', title: 'Role' },
        { id: 'Verified', title: 'Verified' },
        { id: 'Registration Date', title: 'Registration Date' },
        { id: 'Batch Year', title: 'Batch Year' },
        { id: 'Department', title: 'Department' },
        { id: 'Roll Number', title: 'Roll Number' },
        { id: 'Company', title: 'Company' },
        { id: 'Job Title', title: 'Job Title' },
        { id: 'Location', title: 'Location' },
        { id: 'LinkedIn URL', title: 'LinkedIn URL' },
        { id: 'Bio', title: 'Bio' },
        { id: 'Skills', title: 'Skills' },
        { id: 'Profile Photo', title: 'Profile Photo' }
      ]
    });

    // Write CSV file
    await csvWriter.writeRecords(csvData);

    // Send file as download
    res.download(filepath, filename, (err) => {
      // Clean up file after download
      if (!err) {
        fs.unlinkSync(filepath);
      }
    });

  } catch (error) {
    console.error('Error exporting alumni data:', error);
    res.status(500).json({ error: 'Failed to export alumni data' });
  }
});

// Export alumni by batch (admin only)
router.get('/export/batch/:batchYear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchYear } = req.params;
    const { format = 'csv' } = req.query;

    const alumni = await prisma.user.findMany({
      where: {
        role: 'ALUMNI',
        isVerified: true,
        alumniProfile: {
          batchYear: parseInt(batchYear)
        }
      },
      include: {
        alumniProfile: true
      },
      orderBy: { name: 'asc' }
    });

    if (format === 'json') {
      res.json({ alumni });
      return;
    }

    // Prepare CSV data
    const csvData = alumni.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Department': user.alumniProfile?.department || '',
      'Roll Number': user.alumniProfile?.rollNo || '',
      'Company': user.alumniProfile?.company || '',
      'Job Title': user.alumniProfile?.jobTitle || '',
      'Location': user.alumniProfile?.location || '',
      'LinkedIn URL': user.alumniProfile?.linkedinUrl || '',
      'Contact Public': user.alumniProfile?.contactPublic ? 'Yes' : 'No'
    }));

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `batch-${batchYear}-alumni-${timestamp}.csv`;
    const filepath = path.join(reportsDir, filename);

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Department', title: 'Department' },
        { id: 'Roll Number', title: 'Roll Number' },
        { id: 'Company', title: 'Company' },
        { id: 'Job Title', title: 'Job Title' },
        { id: 'Location', title: 'Location' },
        { id: 'LinkedIn URL', title: 'LinkedIn URL' },
        { id: 'Contact Public', title: 'Contact Public' }
      ]
    });

    // Write CSV file
    await csvWriter.writeRecords(csvData);

    // Send file as download
    res.download(filepath, filename, (err) => {
      if (!err) {
        fs.unlinkSync(filepath);
      }
    });

  } catch (error) {
    console.error('Error exporting batch data:', error);
    res.status(500).json({ error: 'Failed to export batch data' });
  }
});

// Export alumni by company (admin only)
router.get('/export/company/:company', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const { format = 'csv' } = req.query;

    const alumni = await prisma.user.findMany({
      where: {
        role: 'ALUMNI',
        isVerified: true,
        alumniProfile: {
          company: {
            contains: company,
            mode: 'insensitive'
          }
        }
      },
      include: {
        alumniProfile: true
      },
      orderBy: { name: 'asc' }
    });

    if (format === 'json') {
      res.json({ alumni });
      return;
    }

    // Prepare CSV data
    const csvData = alumni.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Batch Year': user.alumniProfile?.batchYear || '',
      'Department': user.alumniProfile?.department || '',
      'Job Title': user.alumniProfile?.jobTitle || '',
      'Location': user.alumniProfile?.location || '',
      'LinkedIn URL': user.alumniProfile?.linkedinUrl || ''
    }));

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${company}-alumni-${timestamp}.csv`;
    const filepath = path.join(reportsDir, filename);

    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Batch Year', title: 'Batch Year' },
        { id: 'Department', title: 'Department' },
        { id: 'Job Title', title: 'Job Title' },
        { id: 'Location', title: 'Location' },
        { id: 'LinkedIn URL', title: 'LinkedIn URL' }
      ]
    });

    // Write CSV file
    await csvWriter.writeRecords(csvData);

    // Send file as download
    res.download(filepath, filename, (err) => {
      if (!err) {
        fs.unlinkSync(filepath);
      }
    });

  } catch (error) {
    console.error('Error exporting company data:', error);
    res.status(500).json({ error: 'Failed to export company data' });
  }
});

module.exports = router;