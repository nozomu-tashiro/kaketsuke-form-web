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

    // Application type (新規/更新)
    yPos += 10;
    doc.fontSize(10)
       .font('Helvetica')
       .text('申込種別:', this.margin + 10, yPos);
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(applicationType === 'new' ? '新規' : '更新', this.margin + 80, yPos);
    
    yPos += 20;

    // Application date
    doc.fontSize(10)
       .font('Helvetica')
       .text('お申込日:', this.margin + 10, yPos);
    
    doc.fontSize(10)
       .text(this.formatDate(applicationDate), this.margin + 80, yPos);
    
    yPos += 25;

    // Section: お申込者
    this.drawSectionHeader(doc, yPos, 'お申込者');
    yPos += 20;

    // Applicant name
    doc.fontSize(9)
       .font('Helvetica')
       .text('お申込者様名:', this.margin + 15, yPos);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(applicantName || '', this.margin + 100, yPos);
    yPos += 18;

    // Furigana
    doc.fontSize(9)
       .font('Helvetica')
       .text('フリガナ:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(applicantNameKana || '', this.margin + 100, yPos);
    yPos += 18;

    // Mobile phone
    doc.fontSize(9)
       .text('携帯番号:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(mobilePhone || '', this.margin + 100, yPos);
    yPos += 18;

    // Home phone
    doc.fontSize(9)
       .text('固定番号:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(homePhone || '', this.margin + 100, yPos);
    yPos += 18;

    // Birth date
    doc.fontSize(9)
       .text('生年月日:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(this.formatDate(birthDate), this.margin + 100, yPos);
    yPos += 18;

    // Gender
    doc.fontSize(9)
       .text('性別:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(gender === 'male' ? '男性' : '女性', this.margin + 100, yPos);
    yPos += 25;

    // Section: 入居者・同居人
    if (residents && residents.length > 0) {
      this.drawSectionHeader(doc, yPos, '入居者・同居人');
      yPos += 20;

      residents.forEach((resident, index) => {
        doc.fontSize(9)
           .font('Helvetica')
           .text(`お名前(${index + 1}):`, this.margin + 15, yPos);
        doc.fontSize(10)
           .text(resident.name || '', this.margin + 100, yPos);
        yPos += 15;

        doc.fontSize(9)
           .text('フリガナ:', this.margin + 15, yPos);
        doc.fontSize(10)
           .text(resident.nameKana || '', this.margin + 100, yPos);
        yPos += 15;

        doc.fontSize(9)
           .text('続柄:', this.margin + 15, yPos);
        doc.fontSize(10)
           .text(resident.relationship || '', this.margin + 100, yPos);
        yPos += 20;
      });
    }

    // Section: 対象物件
    this.drawSectionHeader(doc, yPos, '対象物件');
    yPos += 20;

    doc.fontSize(9)
       .font('Helvetica')
       .text('住所:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(propertyAddress || '', this.margin + 100, yPos, {
         width: 400
       });
    yPos += 18;

    doc.fontSize(9)
       .text('物件名:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(propertyName || '', this.margin + 100, yPos);
    yPos += 15;

    doc.fontSize(9)
       .text('フリガナ:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(propertyNameKana || '', this.margin + 100, yPos);
    yPos += 15;

    doc.fontSize(9)
       .text('号室:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(roomNumber || '', this.margin + 100, yPos);
    yPos += 25;

    // Service information
    this.drawSectionHeader(doc, yPos, 'サービス情報');
    yPos += 20;

    doc.fontSize(9)
       .text('商品名:', this.margin + 15, yPos);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(this.getProductName(selectedProduct), this.margin + 100, yPos);
    yPos += 18;

    doc.fontSize(9)
       .font('Helvetica')
       .text('支払方法:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(this.getPaymentMethodText(paymentMethod), this.margin + 100, yPos);
    yPos += 18;

    if (servicePrice) {
      doc.fontSize(9)
         .text('サービス価格:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(`¥${servicePrice}`, this.margin + 100, yPos);
      yPos += 18;
    }

    if (selectedOptions && selectedOptions.length > 0) {
      doc.fontSize(9)
         .text('オプション:', this.margin + 15, yPos);
      
      selectedOptions.forEach((option, index) => {
        doc.fontSize(9)
           .text(`・${this.getOptionName(option)}`, this.margin + 100, yPos);
        yPos += 15;
      });
      yPos += 5;
    }

    if (guaranteeNumber) {
      doc.fontSize(9)
         .text('保証番号:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(guaranteeNumber, this.margin + 100, yPos);
      yPos += 20;
    }

    // Emergency contact (if シニア向けサービス is selected)
    if (selectedOptions && selectedOptions.includes('senior-watch') && emergencyContact) {
      yPos += 5;
      this.drawSectionHeader(doc, yPos, '緊急連絡先');
      yPos += 20;

      doc.fontSize(9)
         .text('お名前:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.name || '', this.margin + 100, yPos);
      yPos += 15;

      doc.fontSize(9)
         .text('フリガナ:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.nameKana || '', this.margin + 100, yPos);
      yPos += 15;

      doc.fontSize(9)
         .text('住所:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.address || '', this.margin + 100, yPos, {
         width: 400
       });
      yPos += 18;

      doc.fontSize(9)
         .text('固定電話:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.homePhone || '', this.margin + 100, yPos);
      yPos += 15;

      doc.fontSize(9)
         .text('携帯電話:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.mobilePhone || '', this.margin + 100, yPos);
      yPos += 15;

      doc.fontSize(9)
         .text('続柄:', this.margin + 15, yPos);
      doc.fontSize(10)
         .text(emergencyContact.relationship || '', this.margin + 100, yPos);
      yPos += 20;
    }

    // Section: 販売店情報
    yPos += 5;
    this.drawSectionHeader(doc, yPos, '販売店情報');
    yPos += 20;

    doc.fontSize(9)
       .font('Helvetica')
       .text('販売店名:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(agentInfo.name || '', this.margin + 100, yPos);
    yPos += 18;

    doc.fontSize(9)
       .text('電話番号:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(agentInfo.phone || '', this.margin + 100, yPos);
    yPos += 18;

    doc.fontSize(9)
       .text('販売店コード:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(agentInfo.code || '', this.margin + 100, yPos);
    yPos += 18;

    doc.fontSize(9)
       .text('担当者名:', this.margin + 15, yPos);
    doc.fontSize(10)
       .text(agentInfo.representativeName || '', this.margin + 100, yPos);
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
