'use client';

import { useState } from 'react';
import { CustomerData } from '@/types/types';

interface CustomerDetailModalProps {
  customer: CustomerData;
  onClose: () => void;
  onSave: (updatedCustomer: CustomerData) => void;
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedCustomer);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>고객 {isEditing ? '정보 수정' : '상세 정보'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              {Object.entries(columnMapping).map(([key, label]) => {
                const fieldKey = key as keyof CustomerData;
                
                // 날짜 필드 처리
                if (key === 'move_in_date' || key === 'move_out_date') {
                  return (
                    <div className="form-group" key={key}>
                      <label htmlFor={key}>{label}</label>
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
                      <label htmlFor={key}>{label}</label>
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
                      <label htmlFor={key}>{label}</label>
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
                    <label htmlFor={key}>{label}</label>
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
            </form>
          ) : (
            <div className="customer-details">
              <table className="details-table">
                <tbody>
                  {Object.entries(columnMapping).map(([key, label]) => {
                    const fieldKey = key as keyof CustomerData;
                    const value = customer[fieldKey];
                    
                    return (
                      <tr key={key}>
                        <th>{label}</th>
                        <td className={columnStyles[key]}>
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
              >
                저장
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