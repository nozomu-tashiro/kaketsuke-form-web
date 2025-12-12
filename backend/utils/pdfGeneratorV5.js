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
      // === USER REQUEST: すべての申込基本情報を印字しない ===
      // 削除された項目:
      // - フリガナ、固定電話、氏名、携帯電話
      // - 生年月日、性別
      // - 申込者住所
      // - 対象物件（物件名フリガナ、物件名、号室）
      // - 入居者・同居人情報
      // - サービス期間（開始日）
      //
      // 印字する項目:
      // - オプションサービスのチェックマーク
      // - 保証番号
      // - 代理店情報

      // === オプションサービスのチェックマーク ===
      // 右上の緑の枠内にチェックマークを印字
      // 対象商品: あんしんサポート24, ホームアシスト24, あんしんフルサポート
      // ※いえらぶ安心サポートは除外
      const excludedProduct = 'ierabu-anshin-support';
      if (selectedProduct !== excludedProduct) {
        // ①近隣トラブル解決支援サービス
        if (selectedOptions.includes('neighbor-trouble')) {
          page.drawText('✓', {
            x: 376,
            y: 782,
            size: fontSize.large,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // ②シニア向け総合見守りサービス
        if (selectedOptions.includes('senior-watch')) {
          page.drawText('✓', {
            x: 376,
            y: 762,
            size: fontSize.large,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // ③家電の安心修理サポート Syu-ri!
        if (selectedOptions.includes('appliance-support')) {
          page.drawText('✓', {
            x: 376,
            y: 742,
            size: fontSize.large,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // === 保証番号 ===
      // サービス期間の行の右側に印字
      if (guaranteeNumber) {
        page.drawText(guaranteeNumber, {
          x: 430,
          y: 448,
          size: fontSize.large,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === サービス提供価格（月払の場合のみ印字） ===
      // 月払を選択したときのみ「サービス提供価格（円/税込）/毎月」に印字
      if (servicePrice && paymentMethod === 'monthly') {
        page.drawText(servicePrice, {
          x: 160,
          y: 465,
          size: 14,
          font: font,
          color: rgb(0, 0, 0)
        });
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
      // ユーザー提供の最終座標表に基づく配置
      // PDF座標系: 原点(0,0)は左下、Yは下から上へ増加
      const agentFontSize = fontSize.large; // 12pt
      const lineHeight = 13; // 行間
      
      // Box 1: 販売店名
      // X座標: 153, Y座標(下から): 140, 最大幅: 105pt, 配置: 左寄せ・上寄せ
      if (agentInfo.name) {
        const maxWidth = 105;
        const nameLines = this.splitTextIntoLines(agentInfo.name, maxWidth, agentFontSize, font);
        nameLines.forEach((line, index) => {
          page.drawText(line, {
            x: 153,
            y: 140 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 2: 電話番号
      // X座標: 153, Y座標(下から): 115, 最大幅: 105pt, 配置: 左寄せ・上寄せ
      if (agentInfo.phone) {
        const maxWidth = 105;
        const phoneLines = this.splitTextIntoLines(agentInfo.phone, maxWidth, agentFontSize, font);
        phoneLines.forEach((line, index) => {
          page.drawText(line, {
            x: 153,
            y: 115 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 3: 販売店コード
      // X座標: 380, Y座標(下から): 140, 最大幅: 160pt, 配置: 左寄せ・上寄せ
      if (agentInfo.code) {
        const maxWidth = 160;
        const codeLines = this.splitTextIntoLines(agentInfo.code, maxWidth, agentFontSize, font);
        codeLines.forEach((line, index) => {
          page.drawText(line, {
            x: 380,
            y: 140 - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 4: 担当者名
      // X座標: 380, Y座標(下から): 115, 最大幅: 160pt, 配置: 左寄せ・上寄せ
      if (agentInfo.representativeName) {
        const maxWidth = 160;
        const repLines = this.splitTextIntoLines(agentInfo.representativeName, maxWidth, agentFontSize, font);
        repLines.forEach((line, index) => {
          page.drawText(line, {
            x: 380,
            y: 115 - (index * lineHeight),
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
