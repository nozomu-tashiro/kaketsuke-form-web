const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF生成システム V5 - テンプレートベース実装
 * 
 * 実際のPDFテンプレートを使用:
 * - 月払テンプレート: monthly_template.pdf (4ページ)
 * - 年払テンプレート: yearly_template.pdf (4ページ)
 * 
 * 印字対象ページ:
 * - 1ページ目: 運営会社控え（代理店控え）
 * - 3ページ目: お客様控え
 * 
 * 日本語フォント: IPAゴシック (ipag.ttf)
 */
class PDFGeneratorV5 {
  
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.fontPath = path.join(this.templatesDir, 'ipag.ttf');
  }

  /**
   * 商品と支払方法に応じてテンプレートを選択
   */
  getTemplatePath(product, paymentMethod) {
    const isYearly = paymentMethod && paymentMethod.startsWith('yearly');
    const paymentType = isYearly ? 'yearly' : 'monthly';
    
    // 商品IDをテンプレート名に変換
    const templateName = `${product}_${paymentType}.pdf`;
    const templatePath = path.join(this.templatesDir, templateName);
    
    // テンプレートファイルが存在するか確認
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
    
    // フォールバック: 旧テンプレート
    console.warn(`Template not found: ${templateName}, using fallback`);
    return path.join(this.templatesDir, isYearly ? 'yearly_template.pdf' : 'monthly_template.pdf');
  }

  async generatePDF(formData) {
    try {
      // 商品と支払方法に応じてテンプレートを選択
      const templatePath = this.getTemplatePath(formData.selectedProduct, formData.paymentMethod);
      
      // テンプレートPDFを読み込み
      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // fontkitを登録
      pdfDoc.registerFontkit(fontkit);
      
      // 日本語フォントを埋め込み
      const fontBytes = fs.readFileSync(this.fontPath);
      const font = await pdfDoc.embedFont(fontBytes);
      
      // 1ページ目（運営会社控え）にデータを印字
      await this.fillPage(pdfDoc, 0, formData, font, '運営会社控え');
      
      // 3ページ目（お客様控え）にデータを印字
      await this.fillPage(pdfDoc, 2, formData, font, 'お客様控え');
      
      // PDF出力
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      throw error;
    }
  }

  async fillPage(pdfDoc, pageIndex, formData, font, copyType) {
    const page = pdfDoc.getPages()[pageIndex];
    const { width, height } = page.getSize();
    
    const {
      selectedProduct,
      paymentMethod,
      applicantName = '',
      applicantNameKana = '',
      mobilePhone = '',
      homePhone = '',
      birthDate = '',
      gender = '',
      residents = [],
      propertyAddress = '',
      propertyName = '',
      propertyNameKana = '',
      roomNumber = '',
      selectedOptions = [],
      servicePrice = '',
      guaranteeNumber = '',
      emergencyContact = {},
      agentInfo = {},
      applicationDate = ''
    } = formData;

    // フォント設定（赤枠内に最適なサイズで収まるよう調整）
    const fontSize = {
      xlarge: 15,
      large: 12,
      medium: 10,
      normal: 9,
      small: 8,
      xsmall: 7
    };

    // 座標設定（PDFの座標系: 左下が原点(0,0)、右上が(width, height)）
    // Y座標 = height - 実際の位置（上からの距離）
    
    try {
      // 商品名は印字しない（専用帳票を使用するため）
      
      // === フリガナ ===
      if (applicantNameKana) {
        const kanaText = this.fitTextInBox(applicantNameKana, 270, fontSize.small, font);
        page.drawText(kanaText, {
          x: 127,
          y: height - 195,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 固定電話 ===
      if (homePhone) {
        page.drawText(homePhone, {
          x: 390,
          y: height - 190,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === お申込者様 ご署名 ===
      if (applicantName) {
        const nameText = this.fitTextInBox(applicantName, 270, fontSize.normal, font);
        page.drawText(nameText, {
          x: 127,
          y: height - 220,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 携帯電話 ===
      if (mobilePhone) {
        page.drawText(mobilePhone, {
          x: 390,
          y: height - 210,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 生年月日 ===
      if (birthDate) {
        const dateParts = this.parseDateString(birthDate);
        page.drawText(dateParts.year, {
          x: 434,
          y: height - 272,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.month, {
          x: 473,
          y: height - 272,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.day, {
          x: 504,
          y: height - 272,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 性別 ===
      if (gender) {
        const xPos = gender === 'male' ? 535 : 560;
        page.drawText('✓', {
          x: xPos,
          y: height - 272,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 申込者住所 ===
      const applicantAddressY = height - 216;
      if (propertyAddress) {
        const lines = this.splitTextIntoLines(propertyAddress, 480, fontSize.small, font);
        lines.forEach((line, idx) => {
          page.drawText(line, {
            x: 114,
            y: applicantAddressY - (idx * 10),
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }

      // === 対象物件 (LEFT COLUMN) ===
      const propertyY = height - 267;
      
      // 物件名フリガナ
      if (propertyNameKana) {
        const kanaText = this.fitTextInBox(propertyNameKana, 185, fontSize.small, font);
        page.drawText(kanaText, {
          x: 136,
          y: propertyY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // 物件名
      if (propertyName) {
        const nameText = this.fitTextInBox(propertyName, 185, fontSize.normal, font);
        page.drawText(nameText, {
          x: 136,
          y: height - 285,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 入居者・同居人 (RIGHT COLUMN) ===
      let residentY = height - 267;
      residents.slice(0, 3).forEach((resident, index) => {
        // フリガナ
        if (resident.nameKana) {
          const kanaText = this.fitTextInBox(resident.nameKana, 155, fontSize.small, font);
          page.drawText(kanaText, {
            x: 324,
            y: residentY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 続柄
        if (resident.relationship) {
          page.drawText(resident.relationship, {
            x: 520,
            y: residentY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        residentY -= 18;
        
        // お名前
        if (resident.name) {
          const nameText = this.fitTextInBox(resident.name, 155, fontSize.normal, font);
          page.drawText(nameText, {
            x: 324,
            y: residentY,
            size: fontSize.normal,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        residentY -= 26;
      });

      // 号室/部屋番号 (RIGHT SIDE)
      if (roomNumber) {
        page.drawText(roomNumber, {
          x: 560,
          y: height - 285,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === サービス期間 ===
      const serviceY = height - 337;
      
      // 開始日
      if (applicationDate) {
        const dateParts = this.parseDateString(applicationDate);
        page.drawText(dateParts.year, {
          x: 174,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.month, {
          x: 217,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.day, {
          x: 248,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 保証番号 ===
      if (guaranteeNumber) {
        page.drawText(guaranteeNumber, {
          x: 360,
          y: serviceY - 13,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === サービス提供料金（月払のみ） ===
      if (paymentMethod === 'monthly' && servicePrice) {
        page.drawText(servicePrice, {
          x: 160,
          y: serviceY - 60,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 緊急連絡先（シニア向けサービス選択時） ===
      if (selectedOptions.includes('senior-watch') && emergencyContact.name) {
        const emergencyY = height - 424;
        
        // フリガナ
        if (emergencyContact.nameKana) {
          const kanaText = this.fitTextInBox(emergencyContact.nameKana, 270, fontSize.small, font);
          page.drawText(kanaText, {
            x: 135,
            y: emergencyY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 固定電話
        if (emergencyContact.homePhone) {
          page.drawText(emergencyContact.homePhone, {
            x: 420,
            y: emergencyY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // お名前
        if (emergencyContact.name) {
          const nameText = this.fitTextInBox(emergencyContact.name, 270, fontSize.normal, font);
          page.drawText(nameText, {
            x: 135,
            y: emergencyY - 17,
            size: fontSize.normal,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 携帯電話
        if (emergencyContact.mobilePhone) {
          page.drawText(emergencyContact.mobilePhone, {
            x: 420,
            y: emergencyY - 17,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 続柄
        if (emergencyContact.relationship) {
          page.drawText(emergencyContact.relationship, {
            x: 478,
            y: emergencyY - 36,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 住所（2行分割対応）
        if (emergencyContact.address) {
          const lines = this.splitTextIntoLines(emergencyContact.address, 440, fontSize.small, font);
          lines.forEach((line, idx) => {
            page.drawText(line, {
              x: 135,
              y: emergencyY - 53 - (idx * 10),
              size: fontSize.small,
              font: font,
              color: rgb(0, 0, 0)
            });
          });
        }
      }
      
      // === キャンセル届（解約届/過去日連絡） ===
      // この部分は申込者様が記入するため印字不要
      
      // === 契約者情報 ===
      const contractorY = height - 625;
      
      // 契約者名（フリガナ）
      if (formData.contractorNameKana) {
        const kanaText = this.fitTextInBox(formData.contractorNameKana, 270, fontSize.small, font);
        page.drawText(kanaText, {
          x: 135,
          y: contractorY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 契約者名
      if (formData.contractorName) {
        const nameText = this.fitTextInBox(formData.contractorName, 270, fontSize.normal, font);
        page.drawText(nameText, {
          x: 135,
          y: contractorY - 17,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 変更届（変更事項）
      if (formData.changeDetails) {
        const changeText = this.fitTextInBox(formData.changeDetails, 290, fontSize.small, font);
        page.drawText(changeText, {
          x: 335,
          y: contractorY - 17,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 担当者名
      if (formData.staffName) {
        page.drawText(formData.staffName, {
          x: 483,
          y: contractorY - 17,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === 代理店情報 ===
      // ユーザー提供の座標表に基づく正確な配置
      // PDF座標系: 原点(0,0)は左下、Yは下から上へ増加
      const agentFontSize = fontSize.large; // 12pt
      const lineHeight = 13; // 行間
      
      // Box 1: 販売店名
      // X座標: 176, Y座標(下から): 209, 最大幅: 305pt, 配置: 左寄せ・上寄せ
      if (agentInfo.name) {
        const maxWidth = 305;
        const nameLines = this.splitTextIntoLines(agentInfo.name, maxWidth, agentFontSize, font);
        nameLines.forEach((line, index) => {
          page.drawText(line, {
            x: 176,
            y: 209 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 2: 電話番号
      // X座標: 176, Y座標(下から): 169, 最大幅: 305pt, 配置: 左寄せ・上寄せ
      if (agentInfo.phone) {
        const maxWidth = 305;
        const phoneLines = this.splitTextIntoLines(agentInfo.phone, maxWidth, agentFontSize, font);
        phoneLines.forEach((line, index) => {
          page.drawText(line, {
            x: 176,
            y: 169 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 3: 販売店コード
      // X座標: 465, Y座標(下から): 199, 最大幅: 85pt, 配置: 左寄せ・上寄せ
      if (agentInfo.code) {
        const maxWidth = 85;
        const codeLines = this.splitTextIntoLines(agentInfo.code, maxWidth, agentFontSize, font);
        codeLines.forEach((line, index) => {
          page.drawText(line, {
            x: 465,
            y: 199 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 4: 担当者名
      // X座標: 465, Y座標(下から): 179, 最大幅: 85pt, 配置: 左寄せ・上寄せ
      if (agentInfo.representativeName) {
        const maxWidth = 85;
        const repLines = this.splitTextIntoLines(agentInfo.representativeName, maxWidth, agentFontSize, font);
        repLines.forEach((line, index) => {
          page.drawText(line, {
            x: 465,
            y: 179 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }

    } catch (error) {
      console.error(`ページ${pageIndex + 1}への印字エラー:`, error);
      throw error;
    }
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

  parseDateString(dateString) {
    if (!dateString) return { year: '', month: '', day: '' };
    
    const date = new Date(dateString);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString(),
      day: date.getDate().toString()
    };
  }

  /**
   * テキストを指定幅に収まるように調整（縮小）
   */
  fitTextInBox(text, maxWidth, fontSize, font) {
    if (!text) return '';
    
    // テキスト幅を計算（近似）
    const textWidth = text.length * fontSize * 0.6; // 日本語の平均幅
    
    if (textWidth <= maxWidth) {
      return text;
    }
    
    // 幅を超える場合は縮小して表示
    const ratio = maxWidth / textWidth;
    const newText = text.substring(0, Math.floor(text.length * ratio) - 2) + '...';
    return newText;
  }

  /**
   * テキストを複数行に分割
   */
  splitTextIntoLines(text, maxWidth, fontSize, font) {
    if (!text) return [];
    
    const charWidth = fontSize * 0.6; // 日本語1文字の平均幅
    const maxChars = Math.floor(maxWidth / charWidth);
    
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < text.length; i++) {
      currentLine += text[i];
      
      if (currentLine.length >= maxChars || i === text.length - 1) {
        lines.push(currentLine);
        currentLine = '';
      }
      
      // 最大2行まで
      if (lines.length >= 2) break;
    }
    
    return lines;
  }
}

module.exports = new PDFGeneratorV5();
