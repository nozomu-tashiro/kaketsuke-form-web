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
      servicePeriodStartDate = '',
      emergencyContact = {},
      agentInfo = {},
      applicationDate = ''
    } = formData;
    
    // デバッグ: 物件情報の値を確認
    console.log('=== 物件情報デバッグ ===');
    console.log('propertyAddress:', propertyAddress);
    console.log('propertyName:', propertyName);
    console.log('propertyNameKana:', propertyNameKana);
    console.log('roomNumber:', roomNumber);
    console.log('selectedProduct:', selectedProduct);
    console.log('=======================');

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
      // - 入居者・同居人情報
      // - サービス期間（開始日）
      //
      // 印字する項目:
      // - 物件情報（住所、物件名、物件名フリガナ、号室）※商品①②③のみ
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
      // 商品と支払方法によって座標が異なる
      // いえらぶ安心サポート: X=430, Y=443（サービス期間の行の右側）
      // 月払（その他）: X=430, Y=448
      // 年払（その他）: X=445, Y=485
      // （値がない場合や「未入力」の場合は印字しない）
      if (guaranteeNumber && guaranteeNumber.trim() !== '' && guaranteeNumber !== '未入力') {
        const isIerabuProduct = selectedProduct === 'ierabu-anshin-support';
        const isYearlyPayment = paymentMethod && paymentMethod.startsWith('yearly');
        
        let guaranteeX, guaranteeY;
        if (isIerabuProduct) {
          // いえらぶ安心サポート選択時は固定
          guaranteeX = 430;
          guaranteeY = 443;
        } else {
          // その他の商品は支払方法で変わる
          guaranteeX = isYearlyPayment ? 445 : 430;
          guaranteeY = isYearlyPayment ? 485 : 448;
        }
        
        page.drawText(guaranteeNumber, {
          x: guaranteeX,
          y: guaranteeY,
          size: fontSize.large,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // === サービス期間開始日 ===
      // 商品①②③で支払方法が【年払】または【月払】の場合に印字
      // いえらぶ安心サポート（④）の場合は印字しない
      const isProducts123 = ['anshin-support-24', 'home-assist-24', 'anshin-full-support'].includes(selectedProduct);
      const isYearlyPayment = paymentMethod && paymentMethod.startsWith('yearly');
      const isMonthlyPayment = paymentMethod === 'monthly';
      
      if (servicePeriodStartDate && servicePeriodStartDate.trim() !== '' && servicePeriodStartDate !== '未入力' && isProducts123) {
        const dateParts = servicePeriodStartDate.split('-'); // ISO形式: YYYY-MM-DD
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          
          // 年払と月払で座標が異なる
          let coords;
          if (isYearlyPayment) {
            // 年払の座標
            coords = {
              year: { x: 153, y: 492 },
              month: { x: 212, y: 492 },
              day: { x: 252, y: 492 }
            };
          } else if (isMonthlyPayment) {
            // 月払の座標
            coords = {
              year: { x: 278, y: 492, size: 14 },
              month: { x: 325, y: 492, size: 14 },
              day: { x: 367, y: 492, size: 14 }
            };
          }
          
          // 座標が設定されている場合のみ印字
          if (coords) {
            // フォントサイズを取得（年払は12pt、月払は14pt）
            const textSize = coords.year.size || fontSize.large;
            
            // 開始日（YYYY）
            page.drawText(year, {
              x: coords.year.x,
              y: coords.year.y,
              size: textSize,
              font: font,
              color: rgb(0, 0, 0)
            });
            
            // 開始日（MM）
            page.drawText(month, {
              x: coords.month.x,
              y: coords.month.y,
              size: textSize,
              font: font,
              color: rgb(0, 0, 0)
            });
            
            // 開始日（DD）
            page.drawText(day, {
              x: coords.day.x,
              y: coords.day.y,
              size: textSize,
              font: font,
              color: rgb(0, 0, 0)
            });
          }
        }
      }

      // === サービス提供価格（月払の場合のみ印字） ===
      // 月払を選択したときのみ「サービス提供価格（円/税込）/毎月」に印字
      // ただし、いえらぶ安心サポート選択時は印字しない
      // （値がない場合や「未入力」の場合は印字しない）
      const isIerabuProduct = selectedProduct === 'ierabu-anshin-support';
      if (servicePrice && servicePrice.trim() !== '' && servicePrice !== '未入力' && paymentMethod === 'monthly' && !isIerabuProduct) {
        page.drawText(servicePrice, {
          x: 160,
          y: 465,
          size: 14,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === 更新時ご請求額（年払の場合のみ印字） ===
      // 年払（yearly-1 または yearly-2）を選択したときのみ印字
      // 【更新時】運営会社（いえらぶ）にて更新案内する場合：更新時ご請求額
      // ただし、いえらぶ安心サポート選択時は印字しない
      // （値がない場合や「未入力」の場合は印字しない）
      const isYearly = paymentMethod && paymentMethod.startsWith('yearly');
      if (servicePrice && servicePrice.trim() !== '' && servicePrice !== '未入力' && isYearly && !isIerabuProduct) {
        page.drawText(servicePrice, {
          x: 430,
          y: 83,
          size: 14,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === キャンセル届（解約届/過去日連絡） ===
      // この部分は申込者様が記入するため印字不要
      
      // === 契約者情報 ===
      const contractorY = height - 625;
      
      // 契約者名（フリガナ）（値がない場合や「未入力」の場合は印字しない）
      if (formData.contractorNameKana && formData.contractorNameKana.trim() !== '' && formData.contractorNameKana !== '未入力') {
        const kanaText = this.fitTextInBox(formData.contractorNameKana, 270, fontSize.small, font);
        page.drawText(kanaText, {
          x: 135,
          y: contractorY,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 契約者名（値がない場合や「未入力」の場合は印字しない）
      if (formData.contractorName && formData.contractorName.trim() !== '' && formData.contractorName !== '未入力') {
        const nameText = this.fitTextInBox(formData.contractorName, 270, fontSize.normal, font);
        page.drawText(nameText, {
          x: 135,
          y: contractorY - 17,
          size: fontSize.normal,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 変更届（変更事項）（値がない場合や「未入力」の場合は印字しない）
      if (formData.changeDetails && formData.changeDetails.trim() !== '' && formData.changeDetails !== '未入力') {
        const changeText = this.fitTextInBox(formData.changeDetails, 290, fontSize.small, font);
        page.drawText(changeText, {
          x: 335,
          y: contractorY - 17,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 担当者名（値がない場合や「未入力」の場合は印字しない）
      if (formData.staffName && formData.staffName.trim() !== '' && formData.staffName !== '未入力') {
        page.drawText(formData.staffName, {
          x: 483,
          y: contractorY - 17,
          size: fontSize.small,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === 物件情報 ===
      // 商品によって座標が異なる
      const isIerabuForProperty = selectedProduct === 'ierabu-anshin-support';
      
      // 商品①②③の座標
      const coords123 = {
        address: { x: 153, y: 605 },
        propertyName: { x: 153, y: 570 },
        propertyKana: { x: 153, y: 585 },
        roomNumber: { x: 465, y: 570 }
      };
      
      // 商品④いえらぶ安心サポートの座標 (2025-12-15更新)
      const coords4 = {
        address: { x: 153, y: 530 },
        propertyName: { x: 153, y: 495 },
        propertyKana: { x: 153, y: 510 },
        roomNumber: { x: 465, y: 495 }
      };
      
      // 使用する座標を選択
      const coords = isIerabuForProperty ? coords4 : coords123;
      
      // 住所（値がない場合や「未入力」の場合は印字しない）
      if (propertyAddress && propertyAddress.trim() !== '' && propertyAddress !== '未入力') {
        page.drawText(propertyAddress, {
          x: coords.address.x,
          y: coords.address.y,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 物件名（値がない場合や「未入力」の場合は印字しない）
      if (propertyName && propertyName.trim() !== '' && propertyName !== '未入力') {
        page.drawText(propertyName, {
          x: coords.propertyName.x,
          y: coords.propertyName.y,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 物件名フリガナ（値がない場合や「未入力」の場合は印字しない）
      if (propertyNameKana && propertyNameKana.trim() !== '' && propertyNameKana !== '未入力') {
        page.drawText(propertyNameKana, {
          x: coords.propertyKana.x,
          y: coords.propertyKana.y,
          size: fontSize.medium, // 10pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 号室（値がない場合や「未入力」の場合は印字しない）
      if (roomNumber && roomNumber.trim() !== '' && roomNumber !== '未入力') {
        page.drawText(roomNumber, {
          x: coords.roomNumber.x,
          y: coords.roomNumber.y,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === 申込基本情報 ===
      // 全商品共通の座標
      
      // お申込者様名（値がない場合や「未入力」の場合は印字しない）
      if (applicantName && applicantName.trim() !== '' && applicantName !== '未入力') {
        page.drawText(applicantName, {
          x: 125,
          y: 675,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // フリガナ（値がない場合や「未入力」の場合は印字しない）
      if (applicantNameKana && applicantNameKana.trim() !== '' && applicantNameKana !== '未入力') {
        page.drawText(applicantNameKana, {
          x: 125,
          y: 690,
          size: fontSize.medium, // 10pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 携帯番号（値がない場合や「未入力」の場合は印字しない）
      if (mobilePhone && mobilePhone.trim() !== '' && mobilePhone !== '未入力') {
        page.drawText(mobilePhone, {
          x: 430,
          y: 685,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 固定番号（値がない場合や「未入力」の場合は印字しない）
      if (homePhone && homePhone.trim() !== '' && homePhone !== '未入力') {
        page.drawText(homePhone, {
          x: 430,
          y: 665,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // 生年月日を分割（YYYY/MM/DD形式を想定）
      // （値がない場合や「未入力」の場合は印字しない）
      if (birthDate && birthDate.trim() !== '' && birthDate !== '未入力') {
        const birthParts = birthDate.split('-'); // ISO形式: YYYY-MM-DD
        if (birthParts.length === 3) {
          const [year, month, day] = birthParts;
          
          // 生年月日（YYYY）
          page.drawText(year, {
            x: 215,
            y: 640,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
          
          // 生年月日（MM）
          page.drawText(month, {
            x: 278,
            y: 640,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
          
          // 生年月日（DD）
          page.drawText(day, {
            x: 320,
            y: 640,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
      }
      
      // 性別（チェックマーク）
      // 値が設定されている場合のみ印字（'male'または'female'）
      // 空文字列の場合は印字しない
      if (gender === 'male') {
        // 男性の場合
        page.drawText('✓', {
          x: 477,
          y: 640,
          size: fontSize.large, // 12pt
          font: font,
          color: rgb(0, 0, 0)
        });
      } else if (gender === 'female') {
        // 女性の場合
        page.drawText('✓', {
          x: 510,
          y: 640,
          size: 13, // 13pt
          font: font,
          color: rgb(0, 0, 0)
        });
      }
      
      // === 代理店情報 ===
      // ユーザー提供の最終座標表に基づく配置
      // PDF座標系: 原点(0,0)は左下、Yは下から上へ増加
      const agentFontSize = fontSize.large; // 12pt
      const lineHeight = 13; // 行間
      
      // いえらぶ安心サポート選択時は座標が異なる
      const isIerabuAnshinSupport = selectedProduct === 'ierabu-anshin-support';
      const box1Y = isIerabuAnshinSupport ? 112 : 140;
      const box2Y = isIerabuAnshinSupport ? 87 : 115;
      const box3Y = isIerabuAnshinSupport ? 112 : 140;
      const box4Y = isIerabuAnshinSupport ? 87 : 115;
      
      // Box 1: 販売店名
      // 通常: X=153, Y=140 / いえらぶ安心サポート: X=153, Y=102
      // （値がない場合や「未入力」の場合は印字しない）
      if (agentInfo.name && agentInfo.name.trim() !== '' && agentInfo.name !== '未入力') {
        const maxWidth = 105;
        const nameLines = this.splitTextIntoLines(agentInfo.name, maxWidth, agentFontSize, font);
        nameLines.forEach((line, index) => {
          page.drawText(line, {
            x: 153,
            y: box1Y - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 2: 電話番号
      // 通常: X=153, Y=115 / いえらぶ安心サポート: X=153, Y=77
      // （値がない場合や「未入力」の場合は印字しない）
      if (agentInfo.phone && agentInfo.phone.trim() !== '' && agentInfo.phone !== '未入力') {
        const maxWidth = 105;
        const phoneLines = this.splitTextIntoLines(agentInfo.phone, maxWidth, agentFontSize, font);
        phoneLines.forEach((line, index) => {
          page.drawText(line, {
            x: 153,
            y: box2Y - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 3: 販売店コード
      // 通常: X=380, Y=140 / いえらぶ安心サポート: X=380, Y=102
      // （値がない場合や「未入力」の場合は印字しない）
      if (agentInfo.code && agentInfo.code.trim() !== '' && agentInfo.code !== '未入力') {
        const maxWidth = 160;
        const codeLines = this.splitTextIntoLines(agentInfo.code, maxWidth, agentFontSize, font);
        codeLines.forEach((line, index) => {
          page.drawText(line, {
            x: 380,
            y: box3Y - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }
      
      // Box 4: 担当者名
      // 通常: X=380, Y=115 / いえらぶ安心サポート: X=380, Y=77
      // （値がない場合や「未入力」の場合は印字しない）
      if (agentInfo.representativeName && agentInfo.representativeName.trim() !== '' && agentInfo.representativeName !== '未入力') {
        const maxWidth = 160;
        const repLines = this.splitTextIntoLines(agentInfo.representativeName, maxWidth, agentFontSize, font);
        repLines.forEach((line, index) => {
          page.drawText(line, {
            x: 380,
            y: box4Y - (index * lineHeight),
            size: agentFontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
        });
      }

      // === 入居者・同居人情報 ===
      // 商品①②③の場合のみ印字（最大2名まで）
      // いえらぶ安心サポート（④）の場合は印字しない
      const isProducts123ForResidents = ['anshin-support-24', 'home-assist-24', 'anshin-full-support'].includes(selectedProduct);
      
      if (isProducts123ForResidents && residents && residents.length > 0) {
        // 入居者・同居人情報1
        if (residents[0]) {
          const resident1 = residents[0];
          
          // お名前
          if (resident1.name && resident1.name.trim() !== '' && resident1.name !== '未入力') {
            const nameText = this.fitTextInBox(resident1.name, 100, fontSize.large, font);
            page.drawText(nameText, {
              x: 153,
              y: 530,
              size: fontSize.large, // 12pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
          
          // フリガナ（お名前の上に印字）
          if (resident1.nameKana && resident1.nameKana.trim() !== '' && resident1.nameKana !== '未入力') {
            const kanaText = this.fitTextInBox(resident1.nameKana, 90, fontSize.medium, font);
            page.drawText(kanaText, {
              x: 153,
              y: 545,
              size: fontSize.medium, // 10pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
          
          // 続柄
          if (resident1.relationship && resident1.relationship.trim() !== '' && resident1.relationship !== '未入力') {
            const relText = this.fitTextInBox(resident1.relationship, 30, 8, font);
            page.drawText(relText, {
              x: 296,
              y: 530,
              size: 8, // 8pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
        }
        
        // 入居者・同居人情報2
        if (residents[1]) {
          const resident2 = residents[1];
          
          // お名前
          if (resident2.name && resident2.name.trim() !== '' && resident2.name !== '未入力') {
            const nameText = this.fitTextInBox(resident2.name, 100, fontSize.large, font);
            page.drawText(nameText, {
              x: 378,
              y: 530,
              size: fontSize.large, // 12pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
          
          // フリガナ（お名前の上に印字）
          if (resident2.nameKana && resident2.nameKana.trim() !== '' && resident2.nameKana !== '未入力') {
            const kanaText = this.fitTextInBox(resident2.nameKana, 90, fontSize.medium, font);
            page.drawText(kanaText, {
              x: 378,
              y: 545,
              size: fontSize.medium, // 10pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
          
          // 続柄
          if (resident2.relationship && resident2.relationship.trim() !== '' && resident2.relationship !== '未入力') {
            const relText = this.fitTextInBox(resident2.relationship, 30, 8, font);
            page.drawText(relText, {
              x: 520,
              y: 530,
              size: 8, // 8pt
              font: font,
              color: rgb(0, 0, 0)
            });
          }
        }
      }
      
      // === 緊急連絡先情報 ===
      // 商品①②③の場合のみ印字
      // いえらぶ安心サポート（④）の場合は印字しない
      const isProducts123ForEmergency = ['anshin-support-24', 'home-assist-24', 'anshin-full-support'].includes(selectedProduct);
      
      if (isProducts123ForEmergency && emergencyContact) {
        // お名前
        if (emergencyContact.name && emergencyContact.name.trim() !== '' && emergencyContact.name !== '未入力') {
          const nameText = this.fitTextInBox(emergencyContact.name, 165, fontSize.large, font);
          page.drawText(nameText, {
            x: 153,
            y: 400,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // フリガナ
        if (emergencyContact.nameKana && emergencyContact.nameKana.trim() !== '' && emergencyContact.nameKana !== '未入力') {
          const kanaText = this.fitTextInBox(emergencyContact.nameKana, 165, fontSize.medium, font);
          page.drawText(kanaText, {
            x: 153,
            y: 420,
            size: fontSize.medium, // 10pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 住所
        if (emergencyContact.address && emergencyContact.address.trim() !== '' && emergencyContact.address !== '未入力') {
          const addressText = this.fitTextInBox(emergencyContact.address, 200, fontSize.large, font);
          page.drawText(addressText, {
            x: 153,
            y: 360,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 固定番号
        if (emergencyContact.homePhone && emergencyContact.homePhone.trim() !== '' && emergencyContact.homePhone !== '未入力') {
          const homePhoneText = this.fitTextInBox(emergencyContact.homePhone, 105, fontSize.large, font);
          page.drawText(homePhoneText, {
            x: 430,
            y: 410,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 携帯番号
        if (emergencyContact.mobilePhone && emergencyContact.mobilePhone.trim() !== '' && emergencyContact.mobilePhone !== '未入力') {
          const mobilePhoneText = this.fitTextInBox(emergencyContact.mobilePhone, 105, fontSize.large, font);
          page.drawText(mobilePhoneText, {
            x: 430,
            y: 390,
            size: fontSize.large, // 12pt
            font: font,
            color: rgb(0, 0, 0)
          });
        }
        
        // 続柄
        if (emergencyContact.relationship && emergencyContact.relationship.trim() !== '' && emergencyContact.relationship !== '未入力') {
          const relText = this.fitTextInBox(emergencyContact.relationship, 30, 8, font);
          page.drawText(relText, {
            x: 520,
            y: 370,
            size: 8, // 8pt
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
