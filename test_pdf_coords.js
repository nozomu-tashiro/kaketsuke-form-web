const generator = require('./backend/utils/pdfGeneratorV5');
const fs = require('fs');

const testData = {
  selectedProduct: 'anshin-support-24',
  paymentMethod: 'yearly-2',
  applicationDate: '2024-12-09',
  applicantName: '山田 太郎',
  applicantNameKana: 'ヤマダ タロウ',
  mobilePhone: '090-4955-2784',
  homePhone: '03-1234-5678',
  birthDate: '1973-12-28',
  gender: 'male',
  residents: [
    {
      name: '山田 花子',
      nameKana: 'ヤマダ ハナコ',
      relationship: '妻'
    },
    {
      name: '山田 花子2',
      nameKana: 'ヤマダ ハナコ2',
      relationship: '子'
    }
  ],
  propertyAddress: '東京都渋谷区神宮前１丁目２番３号',
  propertyName: '神宮前マンション',
  propertyNameKana: 'ジングウマエマンション',
  roomNumber: '101',
  agentInfo: {
    name: '不動産販売株式会社',
    code: 'AGENT001',
    contactPerson: '担当者名'
  }
};

generator.generatePDF(testData)
  .then(pdfBytes => {
    fs.writeFileSync('test_current_coords.pdf', pdfBytes);
    console.log('PDF generated successfully: test_current_coords.pdf');
    console.log(`PDF size: ${(pdfBytes.length / 1024).toFixed(1)} KB`);
  })
  .catch(error => {
    console.error('Error generating PDF:', error);
    process.exit(1);
  });
