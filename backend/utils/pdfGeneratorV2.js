const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFGeneratorV2 {
  
  constructor() {
    // A4サイズ (595.28 x 841.89 points)
    this.pageWidth = 595.28;
    this.pageHeight = 841.89;
    this.margin = 20;
    
    // スケール係数（Excelの列幅をPDFポイントに変換）
    // Excelの標準列幅は約8.43文字、各列約6pt
    this.colWidth = 6;
    this.rowHeight = 15;
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

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // 代理店控えを生成
        this.generateFormPage(doc, formData, '【運営会社控】');
        
        // お客様控えを生成
        doc.addPage();
        this.generateFormPage(doc, formData, '【お客様控え】');

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  generateFormPage(doc, formData, copyType) {
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

    let yPos = this.margin;
    
    // タイトル部分
    this.drawTitle(doc, selectedProduct, paymentMethod, copyType, yPos);
    yPos += 50;

    // 付帯サービスチェックボックス（右上）
    this.drawOptionalServices(doc, selectedOptions, this.pageWidth - 150, this.margin + 30);

    // お申込者記入欄
    yPos = this.drawApplicantSection(doc, {
      applicantName,
      applicantNameKana,
      mobilePhone,
      homePhone,
      birthDate,
      gender
    }, yPos);
    yPos += 10;

    // 入居者・同居人
    if (residents.length > 0) {
      yPos = this.drawResidentsSection(doc, residents, yPos);
      yPos += 10;
    }

    // 対象物件
    yPos = this.drawPropertySection(doc, {
      propertyAddress,
      propertyName,
      propertyNameKana,
      roomNumber
    }, yPos);
    yPos += 10;

    // サービス期間
    yPos = this.drawServicePeriodSection(doc, {
      applicationDate,
      paymentMethod,
      guaranteeNumber
    }, yPos);
    yPos += 10;

    // 緊急連絡先（シニア向けサービス選択時のみ）
    if (selectedOptions.includes('senior-watch') && emergencyContact) {
      yPos = this.drawEmergencyContactSection(doc, emergencyContact, yPos);
    }

    // 販売店情報（下部）
    this.drawAgentInfo(doc, agentInfo, this.pageHeight - 120);
  }

  drawTitle(doc, product, paymentMethod, copyType, yPos) {
    // 左側：控えタイプ
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(copyType, this.margin, yPos);

    // 中央：商品タイトル
    const productTitle = this.getProductTitle(product, paymentMethod);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(productTitle, this.margin, yPos + 25, {
         width: this.pageWidth - (this.margin * 2),
         align: 'center'
       });
  }

  drawOptionalServices(doc, selectedOptions, xPos, yPos) {
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('付帯サービス', xPos, yPos);

    const options = [
      { id: 'neighbor-trouble', label: '近隣トラブル解決' },
      { id: 'senior-watch', label: 'シニア見守り' },
      { id: 'appliance-support', label: '家電サポート' }
    ];

    options.forEach((option, index) => {
      const checked = selectedOptions.includes(option.id);
      const checkY = yPos + 15 + (index * 15);
      
      // チェックボックス
      doc.rect(xPos, checkY, 10, 10).stroke();
      if (checked) {
        doc.fontSize(10).text('✓', xPos + 2, checkY);
      }
      
      // ラベル
      doc.fontSize(8)
         .font('Helvetica')
         .text(option.label, xPos + 15, checkY + 2);
    });
  }

  drawApplicantSection(doc, data, yPos) {
    // セクションヘッダー
    this.drawSectionHeader(doc, '▽お申込者ご記入欄（必須記載）', yPos);
    yPos += 20;

    const leftWidth = 350;
    const rightX = this.margin + leftWidth + 10;

    // フリガナ
    yPos = this.drawField(doc, 'フリガナ', data.applicantNameKana, this.margin, yPos, leftWidth, 18);
    
    // 固定電話（右側）
    this.drawField(doc, '固定電話', data.homePhone, rightX, yPos - 18, 150, 18);

    // 申込者名
    yPos = this.drawField(doc, 'お申込者 ご署名', data.applicantName, this.margin, yPos, leftWidth, 40);
    
    // 携帯電話（右側）
    this.drawField(doc, '携帯電話', data.mobilePhone, rightX, yPos - 40, 150, 18);

    // 生年月日と性別
    const birthParts = this.parseDateString(data.birthDate);
    const birthY = yPos;
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('生年月日', this.margin, birthY);
    
    let dateX = this.margin + 60;
    doc.text('西暦', dateX, birthY);
    dateX += 30;
    
    // 年
    this.drawInputBox(doc, dateX, birthY - 2, 50, 18, birthParts.year);
    dateX += 55;
    doc.text('年', dateX, birthY);
    dateX += 20;
    
    // 月
    this.drawInputBox(doc, dateX, birthY - 2, 35, 18, birthParts.month);
    dateX += 40;
    doc.text('月', dateX, birthY);
    dateX += 20;
    
    // 日
    this.drawInputBox(doc, dateX, birthY - 2, 35, 18, birthParts.day);
    dateX += 40;
    doc.text('日', dateX, birthY);
    
    // 性別（右側）
    doc.text('性別', dateX + 30, birthY);
    this.drawInputBox(doc, dateX + 60, birthY - 2, 80, 18, data.gender === 'male' ? '男性' : '女性');
    
    return yPos + 30;
  }

  drawResidentsSection(doc, residents, yPos) {
    this.drawSectionHeader(doc, '入居者・同居人', yPos);
    yPos += 20;

    residents.forEach((resident, index) => {
      if (index < 2) { // 最大2名まで表示
        // フリガナ
        yPos = this.drawField(doc, 'フリガナ', resident.nameKana, this.margin, yPos, 380, 15);
        
        // 続柄（右側）
        this.drawField(doc, '続柄', resident.relationship, this.pageWidth - 120 - this.margin, yPos - 15, 100, 15);
        
        // 名前
        yPos = this.drawField(doc, 'お名前', resident.name, this.margin, yPos, 480, 25);
      }
    });

    return yPos;
  }

  drawPropertySection(doc, data, yPos) {
    this.drawSectionHeader(doc, '対象物件', yPos);
    yPos += 20;

    // 住所
    yPos = this.drawField(doc, '住所', data.propertyAddress, this.margin, yPos, this.pageWidth - (this.margin * 2) - 80, 20);

    // フリガナと号室
    const furiganaY = yPos;
    yPos = this.drawField(doc, 'フリガナ', data.propertyNameKana, this.margin, yPos, 380, 15);
    
    // 号室/部屋番号（右側）
    this.drawField(doc, '号室/部屋番号', data.roomNumber, this.pageWidth - 120 - this.margin, furiganaY, 100, 15);

    // 物件名
    yPos = this.drawField(doc, '物件名', data.propertyName, this.margin, yPos, 480, 25);

    return yPos;
  }

  drawServicePeriodSection(doc, data, yPos) {
    this.drawSectionHeader(doc, 'サービス期間', yPos);
    yPos += 20;

    const dateParts = this.parseDateString(data.applicationDate);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('西暦', this.margin, yPos);
    
    let dateX = this.margin + 30;
    
    // 年
    this.drawInputBox(doc, dateX, yPos - 2, 50, 18, dateParts.year);
    dateX += 55;
    doc.text('年', dateX, yPos);
    dateX += 20;
    
    // 月
    this.drawInputBox(doc, dateX, yPos - 2, 35, 18, dateParts.month);
    dateX += 40;
    doc.text('月', dateX, yPos);
    dateX += 20;
    
    // 日
    this.drawInputBox(doc, dateX, yPos - 2, 35, 18, dateParts.day);
    dateX += 40;
    doc.text('日', dateX, yPos);

    yPos += 25;
    doc.fontSize(9)
       .text('から２年後応答月の月末まで', this.margin, yPos);

    // 保証番号
    if (data.guaranteeNumber) {
      yPos += 20;
      doc.text('いえらぶ安心保証 契約者', this.margin, yPos);
      doc.text('保証番号', this.margin + 150, yPos);
      this.drawInputBox(doc, this.margin + 200, yPos - 2, 150, 18, data.guaranteeNumber);
    }

    return yPos + 30;
  }

  drawEmergencyContactSection(doc, contact, yPos) {
    this.drawSectionHeader(doc, '緊急連絡先 ※シニア向け総合見守りサービス 必須情報', yPos);
    yPos += 20;

    // フリガナ
    yPos = this.drawField(doc, 'フリガナ', contact.nameKana, this.margin, yPos, 350, 15);
    
    // 固定電話（右側）
    this.drawField(doc, '固定電話', contact.homePhone, this.pageWidth - 180 - this.margin, yPos - 15, 160, 15);

    // 名前
    yPos = this.drawField(doc, 'お名前', contact.name, this.margin, yPos, 350, 25);
    
    // 携帯電話（右側）
    this.drawField(doc, '携帯電話', contact.mobilePhone, this.pageWidth - 180 - this.margin, yPos - 25, 160, 15);

    // 住所
    yPos = this.drawField(doc, '住所', contact.address, this.margin, yPos, this.pageWidth - (this.margin * 2), 20);

    return yPos;
  }

  drawAgentInfo(doc, agentInfo, yPos) {
    this.drawSectionHeader(doc, '販売店情報', yPos);
    yPos += 20;

    doc.fontSize(9)
       .font('Helvetica')
       .text(`販売店名: ${agentInfo.name || ''}`, this.margin, yPos);
    yPos += 15;
    doc.text(`電話番号: ${agentInfo.phone || ''}`, this.margin, yPos);
    yPos += 15;
    doc.text(`販売店コード: ${agentInfo.code || ''}`, this.margin, yPos);
    yPos += 15;
    doc.text(`担当者名: ${agentInfo.representativeName || ''}`, this.margin, yPos);
  }

  drawSectionHeader(doc, title, yPos) {
    const headerWidth = this.pageWidth - (this.margin * 2);
    
    // 背景
    doc.rect(this.margin, yPos, headerWidth, 18)
       .fillAndStroke('#e0e0e0', '#000000');
    
    // テキスト
    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(title, this.margin + 5, yPos + 4);
  }

  drawField(doc, label, value, x, y, width, height) {
    // ラベル
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#000000')
       .text(label, x, y);
    
    const labelWidth = 60;
    const boxX = x + labelWidth;
    const boxWidth = width - labelWidth;
    
    // 入力ボックス
    doc.rect(boxX, y - 2, boxWidth, height)
       .stroke('#000000');
    
    // 値
    if (value) {
      const fontSize = height > 20 ? 12 : 9;
      doc.fontSize(fontSize)
         .font('Helvetica')
         .text(value, boxX + 5, y + (height - fontSize) / 2, {
           width: boxWidth - 10,
           ellipsis: true
         });
    }
    
    return y + height + 5;
  }

  drawInputBox(doc, x, y, width, height, value) {
    // ボックス
    doc.rect(x, y, width, height)
       .stroke('#000000');
    
    // 値
    if (value) {
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#000000')
         .text(value, x + 5, y + 4, {
           width: width - 10,
           ellipsis: true
         });
    }
  }

  parseDateString(dateString) {
    if (!dateString) return { year: '', month: '', day: '' };
    
    const date = new Date(dateString);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      day: date.getDate().toString().padStart(2, '0')
    };
  }

  getProductTitle(product, paymentMethod) {
    const titles = {
      'anshin-support-24': 'あんしんサポート２４',
      'home-assist-24': 'ホームアシスト２４',
      'anshin-full-support': 'あんしんフルサポート',
      'ierabu-anshin-support': 'いえらぶ安心サポート'
    };
    
    const paymentText = this.getPaymentMethodText(paymentMethod);
    return `${titles[product] || '駆付けサービス'} ${paymentText} 入会申込書`;
  }

  getPaymentMethodText(method) {
    const methods = {
      'monthly': '月払',
      'yearly-1': '年払（1年更新）',
      'yearly-2': '年払（2年更新）'
    };
    return methods[method] || method;
  }
}

module.exports = new PDFGeneratorV2();
