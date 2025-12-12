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
    
    // Validate required fields (minimum requirements)
    // Set defaults if not provided
    if (!formData.applicationType) {
      formData.applicationType = 'new';
    }
    if (!formData.applicantName) {
      formData.applicantName = '未入力';
    }
    
    // Log received data for debugging
    console.log('Received PDF generation request:', {
      applicationType: formData.applicationType,
      applicantName: formData.applicantName,
      selectedProduct: formData.selectedProduct,
      paymentMethod: formData.paymentMethod
    });

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
