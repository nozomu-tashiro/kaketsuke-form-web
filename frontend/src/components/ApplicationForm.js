import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ApplicationForm.css';

const ApplicationForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    applicationType: 'new',
    applicationDate: new Date().toISOString().split('T')[0],
    applicantName: '',
    applicantNameKana: '',
    mobilePhone: '',
    homePhone: '',
    birthDate: '',
    gender: 'male',
    residents: [],
    propertyAddress: '',
    propertyName: '',
    propertyNameKana: '',
    roomNumber: '',
    selectedProduct: 'anshin-support-24',
    paymentMethod: 'monthly',
    selectedOptions: [],
    servicePrice: '',
    guaranteeNumber: '',
    emergencyContact: {
      name: '',
      nameKana: '',
      address: '',
      homePhone: '',
      mobilePhone: '',
      relationship: ''
    },
    agentInfo: {
      name: '',
      phone: '',
      code: '',
      representativeName: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle checkbox changes for options
  const handleOptionChange = (option) => {
    setFormData(prev => {
      const selectedOptions = prev.selectedOptions.includes(option)
        ? prev.selectedOptions.filter(opt => opt !== option)
        : [...prev.selectedOptions, option];
      
      return {
        ...prev,
        selectedOptions
      };
    });
  };

  // Add resident
  const addResident = () => {
    setFormData(prev => ({
      ...prev,
      residents: [...prev.residents, { name: '', nameKana: '', relationship: '' }]
    }));
  };

  // Remove resident
  const removeResident = (index) => {
    setFormData(prev => ({
      ...prev,
      residents: prev.residents.filter((_, i) => i !== index)
    }));
  };

  // Update resident
  const updateResident = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      residents: prev.residents.map((resident, i) => 
        i === index ? { ...resident, [field]: value } : resident
      )
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.applicantName) {
      setError('お申込者様名を入力してください');
      return false;
    }
    if (!formData.applicationDate) {
      setError('お申込日を入力してください');
      return false;
    }
    if (!formData.propertyAddress) {
      setError('物件住所を入力してください');
      return false;
    }
    if (!formData.agentInfo.name) {
      setError('販売店名を入力してください');
      return false;
    }
    
    // Validate emergency contact if senior-watch option is selected
    if (formData.selectedOptions.includes('senior-watch')) {
      if (!formData.emergencyContact.name) {
        setError('シニア向けサービスを選択した場合は緊急連絡先が必須です');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  // Submit form and generate PDF
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/pdf/generate', formData, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `入会申込書_${formData.applicantName}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('PDFの生成に成功しました！');
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('PDFの生成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // Get available payment methods based on selected product
  // 1年更新は最後に配置（基本的に選ばれないため）
  const getAvailablePaymentMethods = () => {
    switch (formData.selectedProduct) {
      case 'anshin-support-24':
      case 'home-assist-24':
        return [
          { value: 'monthly', label: '月払' },
          { value: 'yearly-2', label: '年払（2年更新）' },
          { value: 'yearly-1', label: '年払（1年更新）', warning: true }
        ];
      case 'anshin-full-support':
        return [{ value: 'monthly', label: '月払' }];
      case 'ierabu-anshin-support':
        return [{ value: 'yearly-2', label: '年払（2年更新）' }];
      default:
        return [{ value: 'monthly', label: '月払' }];
    }
  };

  return (
    <div className="application-form-container">
      <form onSubmit={handleSubmit} className="application-form">
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 商品・サービス選択 */}
        <section className="form-section">
          <h2 className="section-title">商品・サービス選択</h2>
          
          <div className="form-row">
            <label className="form-label">
              商品ラインナップ <span className="required">*</span>
            </label>
            <select
              name="selectedProduct"
              value={formData.selectedProduct}
              onChange={(e) => {
                handleInputChange(e);
                // Reset payment method when product changes
                const availableMethods = getAvailablePaymentMethods();
                if (availableMethods.length > 0) {
                  setFormData(prev => ({
                    ...prev,
                    selectedProduct: e.target.value,
                    paymentMethod: availableMethods[0].value
                  }));
                }
              }}
              className="form-select"
              required
            >
              <option value="anshin-support-24">① あんしんサポート２４</option>
              <option value="home-assist-24">② ホームアシスト２４</option>
              <option value="anshin-full-support">③ あんしんフルサポート</option>
              <option value="ierabu-anshin-support">④ いえらぶ安心サポート</option>
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">
              支払方法 <span className="required">*</span>
            </label>
            <div className="payment-method-group">
              {getAvailablePaymentMethods().map(method => (
                <label 
                  key={method.value} 
                  className={`payment-method-label ${method.warning ? 'warning-option' : ''}`}
                  title={method.warning ? '※１年更新プランは基本的に取り扱っておりません' : ''}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={handleInputChange}
                    required
                  />
                  <span>{method.label}</span>
                  {method.warning && (
                    <span className="warning-badge">⚠️</span>
                  )}
                </label>
              ))}
            </div>
            {formData.paymentMethod === 'yearly-1' && (
              <div className="warning-message">
                ⚠️ ※１年更新プランは基本的に取り扱っておりません。（営業担当にお問い合わせください）
              </div>
            )}
          </div>

          <div className="form-row">
            <label className="form-label">
              {formData.paymentMethod === 'monthly' 
                ? 'サービス提供価格（円/税込）/毎月'
                : '【更新時】運営会社（いえらぶ）にて更新案内する場合：更新時ご請求額（円/※税別）'
              }
            </label>
            <input
              type="number"
              name="servicePrice"
              value={formData.servicePrice}
              onChange={handleInputChange}
              className="form-input"
              placeholder="15000"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              オプションサービス
            </label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.selectedOptions.includes('neighbor-trouble')}
                  onChange={() => handleOptionChange('neighbor-trouble')}
                />
                近隣トラブル解決支援サービス（マモロッカ）
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.selectedOptions.includes('senior-watch')}
                  onChange={() => handleOptionChange('senior-watch')}
                />
                シニア向け総合見守りサービス（まごころ）
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.selectedOptions.includes('appliance-support')}
                  onChange={() => handleOptionChange('appliance-support')}
                />
                家電の安心サポート（Syu-rIt！シューリット！）
              </label>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">
              保証番号（いえらぶ安心保証契約者の場合）
            </label>
            <input
              type="text"
              name="guaranteeNumber"
              value={formData.guaranteeNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="00000268"
            />
          </div>
        </section>

        {/* 販売店情報 */}
        <section className="form-section">
          <h2 className="section-title">販売店情報</h2>
          
          <div className="form-row">
            <label className="form-label">
              販売店名 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.agentInfo.name}
              onChange={(e) => handleNestedChange('agentInfo', 'name', e.target.value)}
              className="form-input"
              placeholder="いえらぶ不動産販売株式会社"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              電話番号
            </label>
            <input
              type="tel"
              value={formData.agentInfo.phone}
              onChange={(e) => handleNestedChange('agentInfo', 'phone', e.target.value)}
              className="form-input"
              placeholder="03-1234-5678"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              販売店コード
            </label>
            <input
              type="text"
              value={formData.agentInfo.code}
              onChange={(e) => handleNestedChange('agentInfo', 'code', e.target.value)}
              className="form-input"
              placeholder="13-00-11223366-000"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              担当者名
            </label>
            <input
              type="text"
              value={formData.agentInfo.representativeName}
              onChange={(e) => handleNestedChange('agentInfo', 'representativeName', e.target.value)}
              className="form-input"
              placeholder="いえらぶ太郎"
            />
          </div>
        </section>

        {/* 申込基本情報 */}
        <section className="form-section">
          <h2 className="section-title">申込基本情報</h2>
          
          <div className="form-row">
            <label className="form-label">
              申込種別 <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="applicationType"
                  value="new"
                  checked={formData.applicationType === 'new'}
                  onChange={handleInputChange}
                />
                新規
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="applicationType"
                  value="renewal"
                  checked={formData.applicationType === 'renewal'}
                  onChange={handleInputChange}
                />
                更新
              </label>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">
              お申込日 <span className="required">*</span>
            </label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              お申込者様名 <span className="required">*</span>
            </label>
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="山田 太郎"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              フリガナ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="applicantNameKana"
              value={formData.applicantNameKana}
              onChange={handleInputChange}
              className="form-input"
              placeholder="ヤマダ タロウ"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              携帯番号
            </label>
            <input
              type="tel"
              name="mobilePhone"
              value={formData.mobilePhone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="090-1234-5678"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              固定番号
            </label>
            <input
              type="tel"
              name="homePhone"
              value={formData.homePhone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="03-1234-5678"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              生年月日
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              性別
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                />
                男性
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                />
                女性
              </label>
            </div>
          </div>
        </section>

        {/* 入居者・同居人情報 */}
        <section className="form-section">
          <h2 className="section-title">入居者・同居人情報</h2>
          <p className="section-description">
            お申込者以外の方が入居する場合や、法人契約の場合は必ずご記入ください。
          </p>
          
          {formData.residents.map((resident, index) => (
            <div key={index} className="resident-item">
              <h3 className="resident-title">入居者・同居人 {index + 1}</h3>
              
              <div className="form-row">
                <label className="form-label">お名前</label>
                <input
                  type="text"
                  value={resident.name}
                  onChange={(e) => updateResident(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="山田 花子"
                />
              </div>

              <div className="form-row">
                <label className="form-label">フリガナ</label>
                <input
                  type="text"
                  value={resident.nameKana}
                  onChange={(e) => updateResident(index, 'nameKana', e.target.value)}
                  className="form-input"
                  placeholder="ヤマダ ハナコ"
                />
              </div>

              <div className="form-row">
                <label className="form-label">続柄</label>
                <input
                  type="text"
                  value={resident.relationship}
                  onChange={(e) => updateResident(index, 'relationship', e.target.value)}
                  className="form-input"
                  placeholder="妻"
                />
              </div>

              <button
                type="button"
                onClick={() => removeResident(index)}
                className="btn-remove"
              >
                削除
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addResident}
            className="btn-add"
          >
            + 入居者・同居人を追加
          </button>
        </section>

        {/* 対象物件情報 */}
        <section className="form-section">
          <h2 className="section-title">対象物件情報</h2>
          
          <div className="form-row">
            <label className="form-label">
              住所 <span className="required">*</span>
            </label>
            <input
              type="text"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleInputChange}
              className="form-input"
              placeholder="東京都渋谷区〇〇1-2-3"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              物件名
            </label>
            <input
              type="text"
              name="propertyName"
              value={formData.propertyName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="いえらぶマンション"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              物件名フリガナ
            </label>
            <input
              type="text"
              name="propertyNameKana"
              value={formData.propertyNameKana}
              onChange={handleInputChange}
              className="form-input"
              placeholder="イエラブマンション"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              号室
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="101"
            />
          </div>
        </section>

        {/* 緊急連絡先（シニア向けサービス選択時のみ表示） */}
        {formData.selectedOptions.includes('senior-watch') && (
          <section className="form-section">
            <h2 className="section-title">緊急連絡先</h2>
            <p className="section-description">
              シニア向け総合見守りサービスを選択した場合は必須です。
            </p>
            
            <div className="form-row">
              <label className="form-label">
                お名前 <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                className="form-input"
                placeholder="田中 一郎"
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                フリガナ <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContact.nameKana}
                onChange={(e) => handleNestedChange('emergencyContact', 'nameKana', e.target.value)}
                className="form-input"
                placeholder="タナカ イチロウ"
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                住所
              </label>
              <input
                type="text"
                value={formData.emergencyContact.address}
                onChange={(e) => handleNestedChange('emergencyContact', 'address', e.target.value)}
                className="form-input"
                placeholder="東京都港区〇〇1-2-3"
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                固定電話
              </label>
              <input
                type="tel"
                value={formData.emergencyContact.homePhone}
                onChange={(e) => handleNestedChange('emergencyContact', 'homePhone', e.target.value)}
                className="form-input"
                placeholder="03-1234-5678"
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                携帯電話
              </label>
              <input
                type="tel"
                value={formData.emergencyContact.mobilePhone}
                onChange={(e) => handleNestedChange('emergencyContact', 'mobilePhone', e.target.value)}
                className="form-input"
                placeholder="090-1234-5678"
              />
            </div>

            <div className="form-row">
              <label className="form-label">
                続柄
              </label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                className="form-input"
                placeholder="息子"
              />
            </div>
          </section>
        )}

        {/* Submit button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'PDF生成中...' : 'PDFを生成・ダウンロード'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
