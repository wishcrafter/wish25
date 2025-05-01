'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface CreateCustomerTableProps {
  onClose: () => void;
  onTableCreated: () => void;
}

export default function CreateCustomerTable({
  onClose,
  onTableCreated
}: CreateCustomerTableProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTable = async () => {
    setLoading(true);
    setError(null);

    try {
      // 테이블 생성 SQL 실행
      const { error } = await supabase.rpc('create_w_customers_table');
      
      if (error) throw error;

      onTableCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-table-modal">
      <h2>w_customers 테이블 생성</h2>
      <p>
        고정비 관리를 위한 테이블을 생성하시겠습니까?
        <br />
        (기존 테이블이 있다면 삭제됩니다)
      </p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="button-group">
        <button 
          onClick={handleCreateTable}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '생성 중...' : '테이블 생성'}
        </button>
        <button 
          onClick={onClose}
          disabled={loading}
          className="btn-secondary"
        >
          취소
        </button>
      </div>
    </div>
  );
} 