const PDFDocument = require('pdfkit');

/**
 * PDF生成システム V4 - コンパクト&完全版
 * 
 * 新仕様対応:
 * 1. フォーマットは2種類: 年払 と 月払
 * 2. 代理店控えとお客様控えは完全にA4 2ページ（1枚ずつ）
 * 3. 商品名は左上の黄色部分に大きく表示
 * 4. サービス期間は年払いの更新期間に応じて自動切り替え
 *    - yearly-2: "から２年後応答月の月末まで"
 *    - yearly-1: "から１年後応答月の月末まで"
 * 5. 月払の場合はサービス期間のテキスト表示なし
 */
class PDFGeneratorV4 {
  
  constructor() {
    this.pageWidth = 595.28;  // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 25;
    this.contentHeight = this.pageHeight - (this.margin * 2);
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

        // 1ページ目: 運営会社控え
        doc.addPage();
        this.generateCompactFormPage(doc, formData, 'agent');
        
        // 2ページ目: お客様控え
        doc.addPage();
        this.generateCompactFormPage(doc, formData, 'customer');

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  generateCompactFormPage(doc, formData, copyType) {
    const {
      selectedProduct,
      paymentMethod,
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

    let y = this.margin;

    // === ヘッダー部分 ===
    // 左上: 商品名（黄色背景）
    this.drawProductNameBox(doc, selectedProduct, y);
    
    // 右上: 控え種別
    const copyLabel = copyType === 'agent' ? '【運営会社控え】' : '【お客様控え】';
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text(copyLabel, this.pageWidth - 140, y + 5);
    
    y += 45;

    // タイトル
    const titleText = this.getFormTitle(paymentMethod);
    doc.fontSize(13).font('Helvetica-Bold')
       .text(titleText, this.margin, y, {
         width: this.pageWidth - (this.margin * 2),
         align: 'center'
       });
    y += 25;

    // === お申込者情報 ===
    y = this.drawCompactApplicantSection(doc, {
      applicantName,
      applicantNameKana,
      mobilePhone,
      homePhone,
      birthDate,
      gender
    }, y);

    // === 入居者・同居人（最大2人） ===
    if (residents.length > 0) {
      y = this.drawCompactResidentsSection(doc, residents.slice(0, 2), y);
    }

    // === 対象物件 ===
    y = this.drawCompactPropertySection(doc, {
      propertyAddress,
      propertyName,
      propertyNameKana,
      roomNumber
    }, y);

    // === サービス期間 ===
    y = this.drawCompactServicePeriodSection(doc, {
      applicationDate,
      paymentMethod,
      guaranteeNumber
    }, y);

    // === 緊急連絡先（シニア向けサービス選択時のみ） ===
    if (selectedOptions.includes('senior-watch')) {
      y = this.drawCompactEmergencyContactSection(doc, emergencyContact, y);
    }

    // === 販売店情報（下部固定ではなく流れに沿って配置） ===
    y += 5;
    this.drawCompactAgentInfo(doc, agentInfo, y);
  }

  // 商品名ボックス（黄色背景）
  drawProductNameBox(doc, product, y) {
    const boxWidth = 220;
    const boxHeight = 40;

    doc.rect(this.margin, y, boxWidth, boxHeight)
       .fillAndStroke('#FFFF00', '#000000');

    const productName = this.getProductName(product);
    doc.fillColor('#000000').fontSize(18).font('Helvetica-Bold')
       .text(productName, this.margin + 5, y + 10, {
         width: boxWidth - 10,
         align: 'center'
       });
  }

  // フォームタイトル
  getFormTitle(paymentMethod) {
    const isYearly = paymentMethod && paymentMethod.startsWith('yearly');
    return `${isYearly ? '年払' : '月払'} 入会申込書`;
  }

  // 商品名取得
  getProductName(product) {
    const names = {
      'anshin-support-24': 'あんしんサポート２４',
      'home-assist-24': 'ホームアシスト２４',
      'anshin-full-support': 'あんしんフルサポート',
      'ierabu-anshin-support': 'いえらぶ安心サポート'
    };
    return names[product] || product;
  }

  // コンパクトな申込者セクション
  drawCompactApplicantSection(doc, data, y) {
    this.drawSectionHeader(doc, '▽お申込者ご記入欄（必須記載）', y);
    y += 18;

    // フリガナ & 固定電話
    doc.fontSize(8).font('Helvetica').fillColor('#000000')
       .text('フリガナ', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 240, 16, data.applicantNameKana);
    doc.text('固定電話', this.pageWidth - 170, y);
    this.drawBox(doc, this.pageWidth - 110, y - 2, 85, 16, data.homePhone);
    y += 18;

    // 申込者名 & 携帯電話
    doc.text('お申込者 ご署名', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 240, 30, data.applicantName);
    doc.text('携帯電話', this.pageWidth - 170, y + 7);
    this.drawBox(doc, this.pageWidth - 110, y + 5, 85, 16, data.mobilePhone);
    y += 35;

    // 生年月日 & 性別
    const birthParts = this.parseDateString(data.birthDate);
    doc.text('生年月日', this.margin + 5, y);
    
    let x = this.margin + 50;
    doc.text('西暦', x, y);
    x += 25;
    this.drawBox(doc, x, y - 2, 45, 16, birthParts.year);
    x += 48;
    doc.text('年', x, y);
    x += 15;
    this.drawBox(doc, x, y - 2, 30, 16, birthParts.month);
    x += 33;
    doc.text('月', x, y);
    x += 15;
    this.drawBox(doc, x, y - 2, 30, 16, birthParts.day);
    x += 33;
    doc.text('日', x, y);
    
    x += 20;
    doc.text('性別', x, y);
    this.drawBox(doc, x + 25, y - 2, 70, 16, data.gender === 'male' ? '男性' : '女性');
    
    return y + 20;
  }

  // コンパクトな入居者セクション
  drawCompactResidentsSection(doc, residents, y) {
    this.drawSectionHeader(doc, '入居者・同居人', y);
    y += 18;

    residents.forEach((resident, index) => {
      if (index < 2) {
        // フリガナ & 続柄
        doc.fontSize(8).font('Helvetica').fillColor('#000000')
           .text('フリガナ', this.margin + 5, y);
        this.drawBox(doc, this.margin + 50, y - 2, 300, 14, resident.nameKana);
        doc.text('続柄', this.pageWidth - 120, y);
        this.drawBox(doc, this.pageWidth - 80, y - 2, 55, 14, resident.relationship);
        y += 16;

        // 名前
        doc.text('お名前', this.margin + 5, y);
        this.drawBox(doc, this.margin + 50, y - 2, 430, 20, resident.name);
        y += 24;
      }
    });

    return y + 5;
  }

  // コンパクトな物件セクション
  drawCompactPropertySection(doc, data, y) {
    this.drawSectionHeader(doc, '対象物件', y);
    y += 18;

    // 住所
    doc.fontSize(8).font('Helvetica').fillColor('#000000')
       .text('住所', this.margin + 5, y);
    this.drawBox(doc, this.margin + 35, y - 2, 495, 18, data.propertyAddress);
    y += 20;

    // フリガナ & 号室
    doc.text('フリガナ', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 300, 14, data.propertyNameKana);
    doc.text('号室', this.pageWidth - 120, y);
    this.drawBox(doc, this.pageWidth - 80, y - 2, 55, 14, data.roomNumber);
    y += 16;

    // 物件名
    doc.text('物件名', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 480, 22, data.propertyName);
    y += 26;

    return y + 5;
  }

  // コンパクトなサービス期間セクション（重要: 年払の更新期間に応じた表示）
  drawCompactServicePeriodSection(doc, data, y) {
    this.drawSectionHeader(doc, 'サービス期間', y);
    y += 18;

    const dateParts = this.parseDateString(data.applicationDate);
    const isYearly = data.paymentMethod && data.paymentMethod.startsWith('yearly');
    
    // 開始日
    doc.fontSize(8).font('Helvetica').fillColor('#000000')
       .text('西暦', this.margin + 5, y);
    
    let x = this.margin + 35;
    this.drawBox(doc, x, y - 2, 45, 16, dateParts.year);
    x += 48;
    doc.text('年', x, y);
    x += 15;
    this.drawBox(doc, x, y - 2, 30, 16, dateParts.month);
    x += 33;
    doc.text('月', x, y);
    x += 15;
    this.drawBox(doc, x, y - 2, 30, 16, dateParts.day);
    x += 33;
    doc.text('日', x, y);
    y += 20;

    // 年払の場合: 更新期間に応じた黄色テキスト表示
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
      const textWidth = 320;
      doc.rect(this.margin + 5, y - 4, textWidth, 22)
         .fillAndStroke('#FFFF00', '#000000');
      
      doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
         .text(periodText, this.margin + 10, y + 2);
      
      y += 24;
    }

    // 保証番号
    if (data.guaranteeNumber) {
      doc.fontSize(8).font('Helvetica').fillColor('#000000')
         .text('いえらぶ安心保証 契約者', this.margin + 5, y);
      doc.text('保証番号:', this.margin + 140, y);
      this.drawBox(doc, this.margin + 185, y - 2, 120, 16, data.guaranteeNumber);
      y += 20;
    }

    return y + 5;
  }

  // コンパクトな緊急連絡先セクション
  drawCompactEmergencyContactSection(doc, contact, y) {
    this.drawSectionHeader(doc, '緊急連絡先 ※シニア向け総合見守りサービス 必須情報', y);
    y += 18;

    // フリガナ & 固定電話
    doc.fontSize(8).font('Helvetica').fillColor('#000000')
       .text('フリガナ', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 240, 14, contact.nameKana);
    doc.text('固定電話', this.pageWidth - 170, y);
    this.drawBox(doc, this.pageWidth - 110, y - 2, 85, 14, contact.homePhone);
    y += 16;

    // 名前 & 携帯電話
    doc.text('お名前', this.margin + 5, y);
    this.drawBox(doc, this.margin + 50, y - 2, 240, 20, contact.name);
    doc.text('携帯電話', this.pageWidth - 170, y + 3);
    this.drawBox(doc, this.pageWidth - 110, y + 1, 85, 14, contact.mobilePhone);
    y += 24;

    // 住所
    doc.text('住所', this.margin + 5, y);
    this.drawBox(doc, this.margin + 35, y - 2, 495, 18, contact.address);
    y += 22;

    return y + 5;
  }

  // コンパクトな販売店情報
  drawCompactAgentInfo(doc, agentInfo, y) {
    this.drawSectionHeader(doc, '販売店情報', y);
    y += 16;

    doc.fontSize(8).font('Helvetica').fillColor('#000000')
       .text(`販売店名: ${agentInfo.name || ''}`, this.margin + 5, y);
    y += 12;
    doc.text(`電話番号: ${agentInfo.phone || ''}`, this.margin + 5, y);
    y += 12;
    doc.text(`販売店コード: ${agentInfo.code || ''}`, this.margin + 5, y);
    y += 12;
    doc.text(`担当者名: ${agentInfo.representativeName || ''}`, this.margin + 5, y);
  }

  // セクションヘッダー
  drawSectionHeader(doc, title, y) {
    const headerWidth = this.pageWidth - (this.margin * 2);
    
    doc.rect(this.margin, y, headerWidth, 16)
       .fillAndStroke('#e0e0e0', '#000000');
    
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold')
       .text(title, this.margin + 5, y + 4);
  }

  // 入力ボックス
  drawBox(doc, x, y, width, height, value) {
    doc.rect(x, y, width, height).stroke('#000000');
    
    if (value) {
      const fontSize = height > 20 ? 10 : 8;
      doc.fontSize(fontSize).font('Helvetica').fillColor('#000000')
         .text(value, x + 3, y + (height - fontSize) / 2 + 1, {
           width: width - 6,
           ellipsis: true
         });
    }
  }

  // 日付パース
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

module.exports = new PDFGeneratorV4();
