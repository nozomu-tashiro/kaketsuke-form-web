const express = require('express');
const router = express.Router();
const pdfGenerator = require('../utils/pdfGenerator');
const pdfGeneratorV2 = require('../utils/pdfGeneratorV2');

// Generate PDF route
router.post('/generate', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.applicationType || !formData.applicantName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['applicationType', 'applicantName']
      });
    }

    // Generate PDF using V2 (improved layout based on Excel template)
    const pdfBuffer = await pdfGeneratorV2.generatePDF(formData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=application-form.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

module.exports = router;
