const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  
  constructor() {
    // A4サイズ (595.28 x 841.89 points)
    this.pageWidth = 595.28;
    this.pageHeight = 841.89;
    this.margin = 40;
  }

  async generatePDF(formData) {
    return new Promise((resolve, reject) => {
      try {
        const chunks = [];
        const doc = new PDFDocument({
          size: 'A4',
          margin: this.margin,
          bufferPages: true
        });

        // Collect PDF data chunks
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generate both pages (代理店控え and お客様控え)
        this.generateAgentCopy(doc, formData);
        doc.addPage();
        this.generateCustomerCopy(doc, formData);

        // Finalize PDF
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  generateAgentCopy(doc, formData) {
    const copyType = '【代理店控え】';
    this.generatePage(doc, formData, copyType);
  }

  generateCustomerCopy(doc, formData) {
    const copyType = '【お客様控え】';
    this.generatePage(doc, formData, copyType);
  }

  generatePage(doc, formData, copyType) {
    const { 
      applicationType,
      applicationDate,
      applicantName,
      applicantNameKana,
      mobilePhone,
      homePhone,
      birthDate,
      gender,
      residents = [],
      propertyAddress,
      propertyName,
      propertyNameKana,
      roomNumber,
      selectedProduct,
      paymentMethod,
      selectedOptions = [],
      servicePrice,
      guaranteeNumber,
      emergencyContact = {},
      agentInfo = {}
    } = formData;

    // Reset position
    let yPos = this.margin;
    
    // Title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(this.getProductTitle(selectedProduct, paymentMethod), this.margin, yPos, {
         align: 'center',
         width: this.pageWidth - (this.margin * 2)
       });
    
    yPos += 30;
    
    // Copy type (代理店控え / お客様控え)
    doc.fontSize(12)
       .text(copyType, this.margin, yPos, {
         align: 'center',
         width: this.pageWidth - (this.margin * 2)
       });
    
    yPos += 25;

    // Draw border
    this.drawBorder(doc, yPos);

    // Skip all basic information sections per user request
    // Only display agent info, service options, and guarantee number using absolute coordinates

    if (selectedOptions && selectedOptions.length > 0) {
      // Using absolute coordinates from Excel specification
      // Service options positioned at right side boxes
      const optionNames = {
        'neighbor-trouble': '① 近隣トラブル解決支援サービス',
        'senior-watch': '② シニア向り総合見守りサービス', 
        'appliance-support': '③ 家電の安心修理サポート'
      };
      
      const optionCoords = {
        'neighbor-trouble': { x: 376, y: this.pageHeight - 782 }, // Y=782 from bottom
        'senior-watch': { x: 376, y: this.pageHeight - 762 },     // Y=762 from bottom
        'appliance-support': { x: 376, y: this.pageHeight - 742 } // Y=742 from bottom
      };
      
      selectedOptions.forEach((option) => {
        const coords = optionCoords[option];
        const name = optionNames[option];
        if (coords && name) {
          doc.fontSize(12)
             .font('Helvetica')
             .text(name, coords.x, coords.y, {
               align: 'left'
             });
        }
      });
      yPos += 5;
    }

    if (guaranteeNumber) {
      // Using absolute coordinates from Excel specification
      // ④保証番号 - X=430, Y=510 (from bottom), Font size=12pt
      const guaranteeY = this.pageHeight - 510;
      doc.fontSize(12)
         .font('Helvetica')
         .text(guaranteeNumber, 430, guaranteeY, {
           align: 'left'
         });
      yPos += 20;
    }

    // Emergency contact section removed per user request

    // Section: 販売店情報
    // Using absolute coordinates from Excel specification
    // Box 1: 販売店名 - X=153, Y=140 (from bottom), Max width=120pt
    const box1Y = this.pageHeight - 140; // Convert from bottom
    doc.fontSize(10)
       .font('Helvetica')
       .text(agentInfo.name || '', 153, box1Y, {
         width: 120,
         align: 'left'
       });
    
    // Box 2: 電話番号 - X=153, Y=115 (from bottom), Max width=120pt
    const box2Y = this.pageHeight - 115;
    doc.fontSize(10)
       .text(agentInfo.phone || '', 153, box2Y, {
         width: 120,
         align: 'left'
       });
    
    // Box 3: 販売店コード - X=380, Y=140 (from bottom), Max width=110pt
    const box3Y = this.pageHeight - 140;
    doc.fontSize(10)
       .text(agentInfo.code || '', 380, box3Y, {
         width: 110,
         align: 'left'
       });
    
    // Box 4: 担当者名 - X=380, Y=115 (from bottom), Max width=110pt
    const box4Y = this.pageHeight - 115;
    doc.fontSize(10)
       .text(agentInfo.representativeName || '', 380, box4Y, {
         width: 110,
         align: 'left'
       });
  }

  drawBorder(doc, yPos) {
    doc.rect(this.margin, yPos, this.pageWidth - (this.margin * 2), this.pageHeight - yPos - this.margin)
       .stroke();
  }

  drawSectionHeader(doc, yPos, title) {
    const sectionWidth = this.pageWidth - (this.margin * 2) - 20;
    
    doc.rect(this.margin + 10, yPos, sectionWidth, 18)
       .fillAndStroke('#e8e8e8', '#000000');
    
    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(title, this.margin + 15, yPos + 4, {
         width: sectionWidth - 10
       });
  }

  getProductTitle(product, paymentMethod) {
    const titles = {
      'anshin-support-24': `あんしんサポート２４ ${this.getPaymentMethodText(paymentMethod)} 入会申込書`,
      'home-assist-24': `ホームアシスト２４ ${this.getPaymentMethodText(paymentMethod)} 入会申込書`,
      'anshin-full-support': 'あんしんフルサポート 月払 入会申込書',
      'ierabu-anshin-support': 'いえらぶ安心サポート 年払（2年更新） 入会申込書'
    };
    return titles[product] || '駆付けサービス 入会申込書';
  }

  getProductName(product) {
    const names = {
      'anshin-support-24': 'あんしんサポート２４',
      'home-assist-24': 'ホームアシスト２４',
      'anshin-full-support': 'あんしんフルサポート',
      'ierabu-anshin-support': 'いえらぶ安心サポート'
    };
    return names[product] || product;
  }

  getPaymentMethodText(method) {
    const methods = {
      'monthly': '月払',
      'yearly-1': '年払（1年更新）',
      'yearly-2': '年払（2年更新）'
    };
    return methods[method] || method;
  }

  getOptionName(option) {
    const names = {
      'neighbor-trouble': '近隣トラブル解決支援サービス（マモロッカ）',
      'senior-watch': 'シニア向け総合見守りサービス（まごころ）',
      'appliance-support': '家電の安心サポート（Syu-rIt！シューリット！）'
    };
    return names[option] || option;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }
}

module.exports = new PDFGenerator();
