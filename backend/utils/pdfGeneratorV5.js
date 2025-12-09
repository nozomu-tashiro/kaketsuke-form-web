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
    this.monthlyTemplatePath = path.join(this.templatesDir, 'monthly_template.pdf');
    this.yearlyTemplatePath = path.join(this.templatesDir, 'yearly_template.pdf');
    this.fontPath = path.join(this.templatesDir, 'ipag.ttf');
  }

  async generatePDF(formData) {
    try {
      // 支払方法に応じてテンプレートを選択
      const isYearly = formData.paymentMethod && formData.paymentMethod.startsWith('yearly');
      const templatePath = isYearly ? this.yearlyTemplatePath : this.monthlyTemplatePath;
      
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

    // フォント設定
    const fontSize = {
      large: 16,
      medium: 12,
      normal: 10,
      small: 9
    };

    // 座標設定（PDFの座標系: 左下が原点(0,0)、右上が(width, height)）
    // Y座標 = height - 実際の位置（上からの距離）
    
    try {
      // === 商品名（左上の黄色エリア） ===
      const productName = this.getProductName(selectedProduct);
      page.drawText(productName, {
        x: 60,
        y: height - 80,
        size: fontSize.large,
        font: font,
        color: rgb(0, 0, 0)
      });

      // === フリガナ ===
      if (applicantNameKana) {
        page.drawText(applicantNameKana, {
          x: 140,
          y: height - 255,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 固定電話 ===
      if (homePhone) {
        page.drawText(homePhone, {
          x: 430,
          y: height - 255,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === お申込者様 ご署名 ===
      if (applicantName) {
        page.drawText(applicantName, {
          x: 140,
          y: height - 295,
          size: fontSize.medium,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 携帯電話 ===
      if (mobilePhone) {
        page.drawText(mobilePhone, {
          x: 430,
          y: height - 295,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 生年月日 ===
      if (birthDate) {
        const dateParts = this.parseDateString(birthDate);
        page.drawText(dateParts.year, {
          x: 180,
          y: height - 320,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.month, {
          x: 240,
          y: height - 320,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.day, {
          x: 280,
          y: height - 320,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 性別 ===
      if (gender) {
        const genderText = gender === 'male' ? '男' : '女';
        page.drawText(genderText, {
          x: 350,
          y: height - 320,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 入居者・同居人 ===
      let residentY = height - 390;
      residents.slice(0, 2).forEach((resident, index) => {
        // フリガナ
        if (resident.nameKana) {
          page.drawText(resident.nameKana, {
            x: 140,
            y: residentY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 続柄
        if (resident.relationship) {
          page.drawText(resident.relationship, {
            x: 480,
            y: residentY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        residentY -= 20;
        
        // お名前
        if (resident.name) {
          page.drawText(resident.name, {
            x: 140,
            y: residentY,
            size: fontSize.normal,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        residentY -= 35;
      });

      // === 対象物件 ===
      const propertyY = height - 500;
      
      // 住所
      if (propertyAddress) {
        page.drawText(propertyAddress, {
          x: 100,
          y: propertyY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // フリガナ
      if (propertyNameKana) {
        page.drawText(propertyNameKana, {
          x: 140,
          y: propertyY - 25,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // 号室
      if (roomNumber) {
        page.drawText(roomNumber, {
          x: 480,
          y: propertyY - 25,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // 物件名
      if (propertyName) {
        page.drawText(propertyName, {
          x: 140,
          y: propertyY - 50,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === サービス期間 ===
      const serviceY = height - 595;
      
      // 開始日
      if (applicationDate) {
        const dateParts = this.parseDateString(applicationDate);
        page.drawText(dateParts.year, {
          x: 125,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.month, {
          x: 185,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
        page.drawText(dateParts.day, {
          x: 225,
          y: serviceY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === 保証番号 ===
      if (guaranteeNumber) {
        page.drawText(guaranteeNumber, {
          x: 330,
          y: serviceY - 30,
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
        const emergencyY = height - 690;
        
        // フリガナ
        if (emergencyContact.nameKana) {
          page.drawText(emergencyContact.nameKana, {
            x: 140,
            y: emergencyY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 固定電話
        if (emergencyContact.homePhone) {
          page.drawText(emergencyContact.homePhone, {
            x: 430,
            y: emergencyY,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // お名前
        if (emergencyContact.name) {
          page.drawText(emergencyContact.name, {
            x: 140,
            y: emergencyY - 25,
            size: fontSize.normal,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 携帯電話
        if (emergencyContact.mobilePhone) {
          page.drawText(emergencyContact.mobilePhone, {
            x: 430,
            y: emergencyY - 25,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 続柄
        if (emergencyContact.relationship) {
          page.drawText(emergencyContact.relationship, {
            x: 480,
            y: emergencyY - 50,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 住所
        if (emergencyContact.address) {
          page.drawText(emergencyContact.address, {
            x: 100,
            y: emergencyY - 75,
            size: fontSize.small,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
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
}

module.exports = new PDFGeneratorV5();
