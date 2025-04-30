'use client';

import { useState } from 'react';

interface CustomerData {
  id: number;
  room_no: number;
  name: string;
  deposit: number;
  monthly_fee: number;
  first_fee: number;
  move_in_date: string | null;
  move_out_date: string | null;
  status: string;
  memo: string;
  resident_id: string;
  phone: string;
  phone_sub: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface CustomerDetailModalProps {
  customer: CustomerData;
  onClose: () => void;
  onSave: (updatedCustomer: CustomerData) => Promise<boolean>;
  columnMapping: { [key: string]: string };
  columnStyles: { [key: string]: string };
  formatPrice: (price: number) => string;
  formatDate: (dateString: string | null) => string;
  getStatusClass: (status: string) => string;
}

export default function CustomerDetailModal({
  customer,
  onClose,
  onSave,
  columnMapping,
  columnStyles,
  formatPrice,
  formatDate,
  getStatusClass
}: CustomerDetailModalProps) {
  const [editedCustomer, setEditedCustomer] = useState<CustomerData>({...customer});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 수정 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (key: keyof CustomerData, value: any) => {
    setEditedCustomer(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 숫자 입력 핸들러 (금액)
  const handleNumberChange = (key: keyof CustomerData, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10);
    handleInputChange(key, numValue);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await onSave(editedCustomer);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // 컬럼 키 배열을 두 그룹으로 분리
  const keys = Object.keys(columnMapping);
  const midpoint = Math.ceil(keys.length / 2);
  const leftColumnKeys = keys.slice(0, midpoint);
  const rightColumnKeys = keys.slice(midpoint);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ width: '800px', maxWidth: '95vw' }}>
        <div className="modal-header">
          <h2>고객 {isEditing ? '정보 수정' : '상세 정보'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 45%' }}>
                  {leftColumnKeys.map((key) => {
                    const fieldKey = key as keyof CustomerData;
                    
                    // 날짜 필드 처리
                    if (key === 'move_in_date' || key === 'move_out_date') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <input
                            type="date"
                            id={key}
                            value={editedCustomer[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="form-input"
                          />
                        </div>
                      );
                    }
                    
                    // 금액 필드 처리
                    if (key === 'deposit' || key === 'monthly_fee' || key === 'first_fee') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <input
                            type="text"
                            id={key}
                            value={editedCustomer[fieldKey] ? editedCustomer[fieldKey]?.toLocaleString() : ''}
                            onChange={(e) => handleNumberChange(fieldKey, e.target.value)}
                            className="form-input"
                          />
                        </div>
                      );
                    }
                    
                    // 상태 필드 처리
                    if (key === 'status') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <select
                            id={key}
                            value={editedCustomer[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="form-input"
                          >
                            <option value="">선택하세요</option>
                            <option value="입실">입실</option>
                            <option value="퇴실">퇴실</option>
                            <option value="예약">예약</option>
                          </select>
                        </div>
                      );
                    }
                    
                    // 일반 텍스트 필드 처리
                    return (
                      <div className="form-group" key={key}>
                        <label htmlFor={key}>{columnMapping[key]}</label>
                        <input
                          type="text"
                          id={key}
                          value={editedCustomer[fieldKey] as string || ''}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          className="form-input"
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: '1 1 45%' }}>
                  {rightColumnKeys.map((key) => {
                    const fieldKey = key as keyof CustomerData;
                    
                    // 날짜 필드 처리
                    if (key === 'move_in_date' || key === 'move_out_date') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <input
                            type="date"
                            id={key}
                            value={editedCustomer[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="form-input"
                          />
                        </div>
                      );
                    }
                    
                    // 금액 필드 처리
                    if (key === 'deposit' || key === 'monthly_fee' || key === 'first_fee') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <input
                            type="text"
                            id={key}
                            value={editedCustomer[fieldKey] ? editedCustomer[fieldKey]?.toLocaleString() : ''}
                            onChange={(e) => handleNumberChange(fieldKey, e.target.value)}
                            className="form-input"
                          />
                        </div>
                      );
                    }
                    
                    // 상태 필드 처리
                    if (key === 'status') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <select
                            id={key}
                            value={editedCustomer[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="form-input"
                          >
                            <option value="">선택하세요</option>
                            <option value="입실">입실</option>
                            <option value="퇴실">퇴실</option>
                            <option value="예약">예약</option>
                          </select>
                        </div>
                      );
                    }
                    
                    // 메모 필드 특별 처리
                    if (key === 'memo') {
                      return (
                        <div className="form-group" key={key}>
                          <label htmlFor={key}>{columnMapping[key]}</label>
                          <textarea
                            id={key}
                            value={editedCustomer[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            className="form-input"
                            rows={3}
                          />
                        </div>
                      );
                    }
                    
                    // 일반 텍스트 필드 처리
                    return (
                      <div className="form-group" key={key}>
                        <label htmlFor={key}>{columnMapping[key]}</label>
                        <input
                          type="text"
                          id={key}
                          value={editedCustomer[fieldKey] as string || ''}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          className="form-input"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            <div className="customer-details">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 45%' }}>
                  <table className="details-table" style={{ width: '100%' }}>
                    <tbody>
                      {leftColumnKeys.map((key) => {
                        const fieldKey = key as keyof CustomerData;
                        const value = customer[fieldKey];
                        
                        return (
                          <tr key={key}>
                            <th style={{ width: '40%', textAlign: 'left', padding: '8px' }}>{columnMapping[key]}</th>
                            <td className={columnStyles[key]} style={{ padding: '8px' }}>
                              {key === 'deposit' || key === 'monthly_fee' || key === 'first_fee'
                                ? formatPrice(value as number)
                              : key === 'move_in_date' || key === 'move_out_date'
                                ? formatDate(value as string | null)
                              : key === 'status'
                                ? <span className={getStatusClass(value as string)}>
                                    {value || '-'}
                                  </span>
                              : value || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ flex: '1 1 45%' }}>
                  <table className="details-table" style={{ width: '100%' }}>
                    <tbody>
                      {rightColumnKeys.map((key) => {
                        const fieldKey = key as keyof CustomerData;
                        const value = customer[fieldKey];
                        
                        return (
                          <tr key={key}>
                            <th style={{ width: '40%', textAlign: 'left', padding: '8px' }}>{columnMapping[key]}</th>
                            <td className={columnStyles[key]} style={{ padding: '8px' }}>
                              {key === 'deposit' || key === 'monthly_fee' || key === 'first_fee'
                                ? formatPrice(value as number)
                              : key === 'move_in_date' || key === 'move_out_date'
                                ? formatDate(value as string | null)
                              : key === 'status'
                                ? <span className={getStatusClass(value as string)}>
                                    {value || '-'}
                                  </span>
                              : value || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setEditedCustomer({...customer});
                  setIsEditing(false);
                }}
              >
                취소
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                닫기
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={toggleEditMode}
              >
                수정하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 