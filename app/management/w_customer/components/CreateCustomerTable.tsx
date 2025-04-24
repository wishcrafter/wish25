'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function CreateCustomerTable() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTable = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // 테이블 생성 SQL 쿼리
      const { error: createTableError } = await supabase.rpc('create_w_customers_table');

      if (createTableError) {
        throw createTableError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('테이블 생성 중 오류 발생:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-table-container">
      <h3>W스튜디오 고객 테이블 생성</h3>
      <p>이 기능은 Supabase에 'w_customers' 테이블을 자동으로 생성합니다.</p>
      
      {success && (
        <div className="success-message">
          <p>테이블이 성공적으로 생성되었습니다. 페이지를 새로고침하면 데이터를 확인할 수 있습니다.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            페이지 새로고침
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>테이블 생성 중 오류가 발생했습니다:</p>
          <code>{error}</code>
          <p>Supabase 대시보드에서 수동으로 테이블을 생성해야 할 수 있습니다.</p>
        </div>
      )}
      
      <button 
        className="btn btn-primary"
        onClick={createTable}
        disabled={loading || success}
      >
        {loading ? '생성 중...' : '테이블 자동 생성'}
      </button>
    </div>
  );
} 