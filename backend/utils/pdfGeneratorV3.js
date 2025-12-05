const PDFDocument = require('pdfkit');

/**
 * PDF生成システム V3 - シンプル版
 * 
 * 仕様:
 * 1. フォーマットは2種類: 年払 と 月払
 * 2. 代理店控えとお客様控えはA4 2枚綴り
 * 3. 商品名は左上の黄色部分に大きく表示
 * 4. サービス期間は年払いの更新期間に応じて自動切り替え
 * 5. 1年更新は基本的に選ばれない（UI側で警告表示）
 */
class PDFGeneratorV3 {
  
  constructor() {
    this.pageWidth = 595.28;
    this.pageHeight = 841.89;
    this.margin = 30;
  }

  async generatePDF(formData) {
    return new Promise((resolve, reject) => {
      try {
        const chunks = [];
        const doc = new PDFDocument({
          size: 'A4',
          margin: this.margin,
          bufferPages: true,
          autoFirstPage: false
        });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // 代理店控え（1ページ目）
        doc.addPage();
        this.generateFormPage(doc, formData, '【運営会社控え】');
        
        // お客様控え（2ページ目）
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
      selectedProduct,
      paymentMethod,
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
      selectedOptions = [],
      guaranteeNumber,
      emergencyContact = {},
      agentInfo = {}
    } = formData;

    let yPos = this.margin;

    // 左上: 商品名を黄色背景で大きく表示
    this.drawProductNameBox(doc, selectedProduct, yPos);

    // 右上: 運営会社控 / お客様控え
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(copyType, this.pageWidth - 150, yPos + 5);

    yPos += 55;

    // タイトル: 入会申込書
    const titleText = this.getFormTitle(selectedProduct, paymentMethod);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(titleText, this.margin, yPos, {
         width: this.pageWidth - (this.margin * 2),
         align: 'center'
       });

    yPos += 30;

    // お申込者記入欄
    yPos = this.drawApplicantSection(doc, {
      applicantName,
      applicantNameKana,
      mobilePhone,
      homePhone,
      birthDate,
      gender
    }, yPos);

    // 入居者・同居人
    if (residents.length > 0) {
      yPos = this.drawResidentsSection(doc, residents, yPos);
    }

    // 対象物件
    yPos = this.drawPropertySection(doc, {
      propertyAddress,
      propertyName,
      propertyNameKana,
      roomNumber
    }, yPos);

    // サービス期間（重要: 年払の場合、更新期間に応じて表示を切り替え）
    yPos = this.drawServicePeriodSection(doc, {
      applicationDate,
      paymentMethod,
      guaranteeNumber
    }, yPos);

    // 緊急連絡先（シニア向けサービス選択時のみ）
    if (selectedOptions.includes('senior-watch')) {
      yPos = this.drawEmergencyContactSection(doc, emergencyContact, yPos);
    }

    // 販売店情報（下部）
    this.drawAgentInfo(doc, agentInfo, this.pageHeight - 100);
  }

  /**
   * 左上の黄色背景に商品名を大きく表示
   */
  drawProductNameBox(doc, product, yPos) {
    const boxWidth = 250;
    const boxHeight = 50;

    // 黄色背景
    doc.rect(this.margin, yPos, boxWidth, boxHeight)
       .fillAndStroke('#FFFF00', '#000000');

    // 商品名を枠いっぱいに大きく表示
    const productName = this.getProductName(product);
    
    doc.fillColor('#000000')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(productName, this.margin + 10, yPos + 12, {
         width: boxWidth - 20,
         align: 'center'
       });
  }

  /**
   * フォームタイトル生成
   */
  getFormTitle(product, paymentMethod) {
    const isYearly = paymentMethod.startsWith('yearly');
    const paymentText = isYearly ? '年払' : '月払';
    return `${paymentText} 入会申込書`;
  }

  /**
   * 商品名取得
   */
  getProductName(product) {
    const names = {
      'anshin-support-24': 'あんしんサポート２４',
      'home-assist-24': 'ホームアシスト２４',
      'anshin-full-support': 'あんしんフルサポート',
      'ierabu-anshin-support': 'いえらぶ安心サポート'
    };
    return names[product] || product;
  }

  /**
   * サービス期間セクション（重要: 更新期間に応じた表示切り替え）
   */
  drawServicePeriodSection(doc, data, yPos) {
    this.drawSectionHeader(doc, 'サービス期間', yPos);
    yPos += 25;

    const dateParts = this.parseDateString(data.applicationDate);
    const isYearly = data.paymentMethod && data.paymentMethod.startsWith('yearly');
    
    // 開始日
    doc.fontSize(10)
       .font('Helvetica')
       .text('西暦', this.margin + 10, yPos);
    
    let dateX = this.margin + 50;
    this.drawBox(doc, dateX, yPos - 2, 50, 20, dateParts.year);
    dateX += 55;
    doc.text('年', dateX, yPos);
    dateX += 20;
    
    this.drawBox(doc, dateX, yPos - 2, 35, 20, dateParts.month);
    dateX += 40;
    doc.text('月', dateX, yPos);
    dateX += 20;
    
    this.drawBox(doc, dateX, yPos - 2, 35, 20, dateParts.day);
    dateX += 40;
    doc.text('日', dateX, yPos);

    yPos += 30;

    // 重要: 年払の場合、更新期間に応じて表示を切り替え
    if (isYearly) {
      const is2Year = data.paymentMethod === 'yearly-2';
      const is1Year = data.paymentMethod === 'yearly-1';
      
      let periodText = '';
      if (is2Year) {
        periodText = 'から２年後応答月の月末まで';
      } else if (is1Year) {
        periodText = 'から１年後応答月の月末まで';
      } else {
        periodText = 'から２年後応答月の月末まで'; // デフォルト
      }

      // 黄色背景で強調表示
      const textWidth = 350;
      doc.rect(this.margin + 10, yPos - 5, textWidth, 25)
         .fillAndStroke('#FFFF00', '#000000');
      
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(periodText, this.margin + 15, yPos + 2);
      
      yPos += 30;
    }

    // 保証番号
    if (data.guaranteeNumber) {
      yPos += 10;
      doc.fontSize(10)
         .font('Helvetica')
         .text('いえらぶ安心保証 契約者', this.margin + 10, yPos);
      doc.text('保証番号:', this.margin + 200, yPos);
      this.drawBox(doc, this.margin + 260, yPos - 2, 150, 20, data.guaranteeNumber);
      yPos += 25;
    }

    return yPos + 15;
  }

  drawApplicantSection(doc, data, yPos) {
    this.drawSectionHeader(doc, '▽お申込者ご記入欄（必須記載）', yPos);
    yPos += 25;

    // フリガナ
    doc.fontSize(9)
       .font('Helvetica')
       .text('フリガナ', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 300, 18, data.applicantNameKana);
    
    // 固定電話（右）
    doc.text('固定電話', this.pageWidth - 200, yPos);
    this.drawBox(doc, this.pageWidth - 130, yPos - 2, 100, 18, data.homePhone);
    yPos += 25;

    // 申込者名
    doc.text('お申込者 ご署名', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 300, 40, data.applicantName);
    
    // 携帯電話（右）
    doc.text('携帯電話', this.pageWidth - 200, yPos + 10);
    this.drawBox(doc, this.pageWidth - 130, yPos + 8, 100, 18, data.mobilePhone);
    yPos += 50;

    // 生年月日と性別
    const birthParts = this.parseDateString(data.birthDate);
    doc.text('生年月日', this.margin + 10, yPos);
    
    let dateX = this.margin + 70;
    doc.text('西暦', dateX, yPos);
    dateX += 30;
    
    this.drawBox(doc, dateX, yPos - 2, 50, 18, birthParts.year);
    dateX += 55;
    doc.text('年', dateX, yPos);
    dateX += 20;
    
    this.drawBox(doc, dateX, yPos - 2, 35, 18, birthParts.month);
    dateX += 40;
    doc.text('月', dateX, yPos);
    dateX += 20;
    
    this.drawBox(doc, dateX, yPos - 2, 35, 18, birthParts.day);
    dateX += 40;
    doc.text('日', dateX, yPos);
    
    // 性別
    doc.text('性別', dateX + 30, yPos);
    this.drawBox(doc, dateX + 60, yPos - 2, 80, 18, data.gender === 'male' ? '男性' : '女性');
    
    return yPos + 30;
  }

  drawResidentsSection(doc, residents, yPos) {
    this.drawSectionHeader(doc, '入居者・同居人', yPos);
    yPos += 25;

    residents.forEach((resident, index) => {
      if (index < 2) {
        // フリガナ
        doc.fontSize(9)
           .font('Helvetica')
           .text('フリガナ', this.margin + 10, yPos);
        this.drawBox(doc, this.margin + 70, yPos - 2, 350, 15, resident.nameKana);
        
        // 続柄（右）
        doc.text('続柄', this.pageWidth - 150, yPos);
        this.drawBox(doc, this.pageWidth - 110, yPos - 2, 80, 15, resident.relationship);
        yPos += 20;

        // 名前
        doc.text('お名前', this.margin + 10, yPos);
        this.drawBox(doc, this.margin + 70, yPos - 2, 430, 25, resident.name);
        yPos += 35;
      }
    });

    return yPos + 10;
  }

  drawPropertySection(doc, data, yPos) {
    this.drawSectionHeader(doc, '対象物件', yPos);
    yPos += 25;

    // 住所
    doc.fontSize(9)
       .font('Helvetica')
       .text('住所', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 50, yPos - 2, 480, 20, data.propertyAddress);
    yPos += 25;

    // フリガナと号室
    doc.text('フリガナ', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 330, 15, data.propertyNameKana);
    
    doc.text('号室/部屋番号', this.pageWidth - 170, yPos);
    this.drawBox(doc, this.pageWidth - 100, yPos - 2, 70, 15, data.roomNumber);
    yPos += 20;

    // 物件名
    doc.text('物件名', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 460, 25, data.propertyName);
    yPos += 35;

    return yPos + 10;
  }

  drawEmergencyContactSection(doc, contact, yPos) {
    this.drawSectionHeader(doc, '緊急連絡先 ※シニア向け総合見守りサービス 必須情報', yPos);
    yPos += 25;

    // フリガナ
    doc.fontSize(9)
       .font('Helvetica')
       .text('フリガナ', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 300, 15, contact.nameKana);
    
    // 固定電話（右）
    doc.text('固定電話', this.pageWidth - 200, yPos);
    this.drawBox(doc, this.pageWidth - 130, yPos - 2, 100, 15, contact.homePhone);
    yPos += 20;

    // 名前
    doc.text('お名前', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 70, yPos - 2, 300, 25, contact.name);
    
    // 携帯電話（右）
    doc.text('携帯電話', this.pageWidth - 200, yPos + 5);
    this.drawBox(doc, this.pageWidth - 130, yPos + 3, 100, 15, contact.mobilePhone);
    yPos += 35;

    // 住所
    doc.text('住所', this.margin + 10, yPos);
    this.drawBox(doc, this.margin + 50, yPos - 2, 480, 20, contact.address);
    yPos += 25;

    return yPos + 10;
  }

  drawAgentInfo(doc, agentInfo, yPos) {
    this.drawSectionHeader(doc, '販売店情報', yPos);
    yPos += 25;

    doc.fontSize(9)
       .font('Helvetica')
       .text(`販売店名: ${agentInfo.name || ''}`, this.margin + 10, yPos);
    yPos += 15;
    doc.text(`電話番号: ${agentInfo.phone || ''}`, this.margin + 10, yPos);
    yPos += 15;
    doc.text(`販売店コード: ${agentInfo.code || ''}`, this.margin + 10, yPos);
    yPos += 15;
    doc.text(`担当者名: ${agentInfo.representativeName || ''}`, this.margin + 10, yPos);
  }

  drawSectionHeader(doc, title, yPos) {
    const headerWidth = this.pageWidth - (this.margin * 2);
    
    // グレー背景
    doc.rect(this.margin, yPos, headerWidth, 20)
       .fillAndStroke('#e0e0e0', '#000000');
    
    // タイトル
    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(title, this.margin + 10, yPos + 5);
  }

  drawBox(doc, x, y, width, height, value) {
    // 枠線
    doc.rect(x, y, width, height)
       .stroke('#000000');
    
    // 値
    if (value) {
      const fontSize = height > 20 ? 11 : 9;
      doc.fontSize(fontSize)
         .font('Helvetica')
         .fillColor('#000000')
         .text(value, x + 5, y + (height - fontSize) / 2 + 2, {
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
}

module.exports = new PDFGeneratorV3();
