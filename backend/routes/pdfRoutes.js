const express = require('express');
const router = express.Router();
const pdfGenerator = require('../utils/pdfGenerator');
const pdfGeneratorV2 = require('../utils/pdfGeneratorV2');
const pdfGeneratorV3 = require('../utils/pdfGeneratorV3');
const pdfGeneratorV4 = require('../utils/pdfGeneratorV4');
const pdfGeneratorV5 = require('../utils/pdfGeneratorV5');

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

    // Generate PDF using V5 (template-based with Japanese font support)
    const pdfBuffer = await pdfGeneratorV5.generatePDF(formData);
    
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
