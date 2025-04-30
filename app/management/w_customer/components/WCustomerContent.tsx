'use client';

import { useEffect, useState } from 'react';
import { fetchData, updateData, deleteData, insertData } from '../../../../utils/supabase-client-api';
import CreateCustomerTable from './CreateCustomerTable';
import DirectSQL from './DirectSQL';
import CustomerDetailModal from './CustomerDetailModal';

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

interface WCustomerContentProps {
  statusFilter: string;
  onCustomerCreated?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
}

const columnMapping: { [key: string]: string } = {
  room_no: '방 번호',
  name: '고객명',
  deposit: '보증금',
  monthly_fee: '월 이용료',
  move_in_date: '입주일',
  move_out_date: '퇴실일',
  status: '상태'
};

// 모달에서 표시할 모든 컬럼 매핑
const fullColumnMapping: { [key: string]: string } = {
  ...columnMapping,
  first_fee: '초기 비용',
  memo: '메모',
  resident_id: '주민등록번호',
  phone: '연락처',
  phone_sub: '추가 연락처',
  address: '주소'
};

// 컬럼별 스타일 매핑
const columnStyles: { [key: string]: string } = {
  room_no: 'col-number text-center',
  name: 'col-text text-center',
  deposit: 'col-number text-right',
  monthly_fee: 'col-number text-right',
  first_fee: 'col-number text-right',
  move_in_date: 'col-date text-center',
  move_out_date: 'col-date text-center',
  status: 'col-status text-center',
  memo: 'col-text text-center',
  phone: 'col-text text-center',
  phone_sub: 'col-text text-center',
  resident_id: 'col-text text-center',
  address: 'col-text text-center'
};

export default function WCustomerContent({ statusFilter, onCustomerCreated, onLoadingChange, onErrorChange }: WCustomerContentProps) {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableNotFound, setTableNotFound] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 상태 필터링 적용
  useEffect(() => {
    if (statusFilter === '전체') {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(customers.filter((customer: CustomerData) => customer.status === statusFilter));
    }
  }, [statusFilter, customers]);

  // 고객 등록 후 목록 갱신을 위한 함수
  useEffect(() => {
    // onCustomerCreated가 호출되었을 때 새로고침
    if (onCustomerCreated) {
      fetchCustomers();
    }
  }, [onCustomerCreated]);

  // 부모 컴포넌트에 로딩 상태 전달
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // 부모 컴포넌트에 에러 상태 전달
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      
      const result = await fetchData('w_customers', {
        select: '*',
        orderBy: 'room_no',
        ascending: true
      });

      if (!result.success) {
        // 테이블이 존재하지 않는 경우 특별 처리
        if (result.message.includes('does not exist') || result.message.includes('relation "public.w_customers"')) {
          setTableNotFound(true);
        } else {
        }
        throw new Error(result.message);
      }

      setCustomers(result.data || []);
      // 초기 필터링 적용
      if (statusFilter === '전체') {
        setFilteredCustomers(result.data || []);
      } else {
        setFilteredCustomers((result.data || []).filter((customer: CustomerData) => customer.status === statusFilter));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 금액을 원화 형식으로 포맷팅
  const formatPrice = (price: number) => {
    return price ? price.toLocaleString('ko-KR') + '원' : '-';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // 상태에 따른 클래스 부여
  const getStatusClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case '입실':
        return 'status-active';
      case '퇴실':
        return 'status-inactive';
      case '예약':
        return 'status-pending';
      default:
        return '';
    }
  };

  // 상세보기 모달 열기
  const openCustomerDetail = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  // 고객 정보 업데이트 핸들러
  const handleCustomerUpdate = async (updatedCustomer: CustomerData) => {
    try {
      const result = await updateData('w_customers', 
        updatedCustomer, 
        { id: updatedCustomer.id }
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      // 업데이트 성공 시 고객 목록 새로고침
      fetchCustomers();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // 고객 삭제 핸들러
  const handleCustomerDelete = async (customerId: number) => {
    if (!confirm('정말로 이 고객 정보를 삭제하시겠습니까?')) {
      return false;
    }

    try {
      const result = await deleteData('w_customers', { id: customerId });

      if (!result.success) {
        throw new Error(result.message);
      }

      // 삭제 성공 시 고객 목록 새로고침
      fetchCustomers();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // 테이블 생성 완료 후 처리
  const handleTableCreated = () => {
    setTableNotFound(false);
    fetchCustomers();  // 테이블 생성 후 고객 목록 조회
  };

  // 고객 등록 완료 핸들러
  const handleCustomerRegistered = async (customerData: Omit<CustomerData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await insertData('w_customers', customerData);

      if (!result.success) {
        throw new Error(result.message);
      }

      // 등록 성공 시 고객 목록 새로고침
      fetchCustomers();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  if (loading && customers.length === 0) {
    return null;
  }

  if (tableNotFound) {
    return (
      <div className="error-state table-not-found">
        <h3>테이블이 존재하지 않습니다</h3>
        <p>Supabase에 'w_customers' 테이블을 생성해야 합니다.</p>
        
        <CreateCustomerTable 
          onClose={() => window.location.reload()}
          onTableCreated={() => {
            setTableNotFound(false);
            fetchCustomers();
          }}
        />
        
        <DirectSQL 
          onClose={() => window.location.reload()}
          onSuccess={() => {
            setTableNotFound(false);
            fetchCustomers();
          }}
        />
        
        <div className="table-create-guide">
          <h4>테이블 수동 생성 가이드:</h4>
          <p>자동 생성이 작동하지 않는 경우 아래 단계에 따라 수동으로 테이블을 생성하세요:</p>
          <ol>
            <li>Supabase 대시보드에 로그인합니다.</li>
            <li>프로젝트 &gt; 데이터베이스 &gt; 테이블로 이동합니다.</li>
            <li>'새 테이블 만들기' 버튼을 클릭합니다.</li>
            <li>테이블 이름: <code>w_customers</code>를 입력합니다.</li>
            <li>다음 컬럼들을 추가합니다:
              <ul>
                <li>id (int4, primary key)</li>
                <li>room_no (int4)</li>
                <li>name (varchar)</li>
                <li>deposit (int4)</li>
                <li>monthly_fee (int4)</li>
                <li>first_fee (int4)</li>
                <li>move_in_date (date)</li>
                <li>move_out_date (date)</li>
                <li>status (varchar)</li>
                <li>memo (text)</li>
                <li>resident_id (varchar)</li>
                <li>phone (varchar)</li>
                <li>phone_sub (varchar)</li>
                <li>address (varchar)</li>
                <li>created_at (timestamp with time zone, default: now())</li>
                <li>updated_at (timestamp with time zone, default: now())</li>
              </ul>
            </li>
            <li>'저장' 버튼을 클릭하여 테이블을 생성합니다.</li>
          </ol>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div>
      {loading && customers.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}
      
      {filteredCustomers.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {(Object.entries(columnMapping) as [keyof typeof columnMapping, string][]).map(([key, label]) => (
                  <th key={key}>
                    {label}
                  </th>
                ))}
                <th>상세보기</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  {(Object.keys(columnMapping) as (keyof typeof columnMapping)[]).map((key) => (
                    <td key={key} className={columnStyles[key]}>
                      {key === 'deposit' || key === 'monthly_fee' 
                        ? formatPrice(customer[key as keyof CustomerData] as number)
                      : key === 'move_in_date' || key === 'move_out_date'
                        ? formatDate(customer[key as keyof CustomerData] as string | null)
                      : key === 'status'
                        ? <span className={getStatusClass(customer[key as keyof CustomerData] as string)}>
                            {customer[key as keyof CustomerData] || '-'}
                          </span>
                      : key === 'room_no'
                        ? <strong>{customer[key as keyof CustomerData]}</strong>
                      : customer[key as keyof CustomerData] || '-'}
                    </td>
                  ))}
                  <td className="action-column">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => openCustomerDetail(customer)}
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          {statusFilter === '전체' 
            ? '등록된 고객이 없습니다.'
            : `'${statusFilter}' 상태인 고객이 없습니다.`}
        </div>
      )}

      {modalOpen && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setModalOpen(false)}
          onSave={handleCustomerUpdate}
          columnMapping={fullColumnMapping}
          columnStyles={columnStyles}
          formatPrice={formatPrice}
          formatDate={formatDate}
          getStatusClass={getStatusClass}
        />
      )}
    </div>
  );
} 