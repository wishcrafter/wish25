'use client';

import { useState } from 'react';
import { supabaseClient } from '@/utils/supabase';

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
  const [tableName, setTableName] = useState<string>('w_customers');

  const handleCreateTable = async () => {
    try {
      setLoading(true);
      setError(null);

      // CREATE TABLE SQL 실행
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          room_no INTEGER,
          name VARCHAR(50) NOT NULL,
          deposit INTEGER DEFAULT 0,
          monthly_fee INTEGER DEFAULT 0,
          first_fee INTEGER DEFAULT 0,
          move_in_date DATE,
          move_out_date DATE,
          status VARCHAR(10) DEFAULT '입실',
          memo TEXT,
          resident_id VARCHAR(20),
          phone VARCHAR(20),
          phone_sub VARCHAR(20),
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Supabase RPC를 통한 SQL 쿼리 실행
      const { data, error: execError } = await supabaseClient.rpc('exec_sql', {
        sql_query: createTableSQL
      });

      if (execError) throw execError;

      // 성공 시 콜백 호출
      onTableCreated();
      
    } catch (err: any) {
      console.error('테이블 생성 중 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>고객 테이블 생성</h3>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="tableName">테이블 이름</label>
            <input
              type="text"
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              disabled
            />
            <small>기본 테이블 이름은 "w_customers" 입니다.</small>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleCreateTable}
            disabled={loading}
          >
            {loading ? '생성 중...' : '테이블 생성'}
          </button>
        </div>
      </div>
    </div>
  );
} 