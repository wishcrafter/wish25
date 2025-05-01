'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { CustomerData } from '@/types/types';
import CreateCustomerTable from './CreateCustomerTable';
import DirectSQL from './DirectSQL';
import CustomerDetailModal from './CustomerDetailModal';

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
  name: 'col-name',
  deposit: 'col-price',
  monthly_fee: 'col-price',
  first_fee: 'col-price',
  move_in_date: 'col-date',
  move_out_date: 'col-date',
  status: 'col-status',
  memo: 'col-text',
  phone: 'col-text',
  phone_sub: 'col-text',
  resident_id: 'col-text',
  address: 'col-text'
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
      setFilteredCustomers(customers.filter(customer => customer.status === statusFilter));
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
      
      // 먼저 '입주중' 상태를 '입실'로 업데이트
      try {
        const { error: updateError } = await supabase
          .from('w_customers')
          .update({ status: '입실' })
          .eq('status', '입주중');
          
        if (updateError && !updateError.message.includes('does not exist')) {
          console.error('상태 업데이트 중 오류:', updateError);
        }
      } catch (updateErr) {
        console.error('상태 업데이트 시도 중 오류:', updateErr);
      }
      
      const { data, error } = await supabase
        .from('w_customers')
        .select('*')
        .order('room_no', { ascending: true });

      if (error) {
        // 테이블이 존재하지 않는 경우 특별 처리
        if (error.message.includes('does not exist') || error.message.includes('relation "public.w_customers"')) {
          setTableNotFound(true);
          console.error('w_customers 테이블이 존재하지 않습니다:', error);
        } else {
          console.error('Error fetching W스튜디오 고객 정보:', error);
        }
        throw error;
      }

      setCustomers(data || []);
      // 초기 필터링 적용
      if (statusFilter === '전체') {
        setFilteredCustomers(data || []);
      } else {
        setFilteredCustomers((data || []).filter(customer => customer.status === statusFilter));
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
      const { error } = await supabase
        .from('w_customers')
        .update({
          room_no: updatedCustomer.room_no,
          name: updatedCustomer.name,
          deposit: updatedCustomer.deposit,
          monthly_fee: updatedCustomer.monthly_fee,
          first_fee: updatedCustomer.first_fee,
          move_in_date: updatedCustomer.move_in_date,
          move_out_date: updatedCustomer.move_out_date,
          status: updatedCustomer.status,
          memo: updatedCustomer.memo,
          resident_id: updatedCustomer.resident_id,
          phone: updatedCustomer.phone,
          phone_sub: updatedCustomer.phone_sub,
          address: updatedCustomer.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedCustomer.id);
      
      if (error) throw error;
      
      // 고객 목록 업데이트
      const updatedCustomers = customers.map(c => 
        c.id === updatedCustomer.id ? updatedCustomer : c
      );
      setCustomers(updatedCustomers);
      
      // 필터링된 목록도 업데이트
      if (statusFilter === '전체') {
        setFilteredCustomers(updatedCustomers);
      } else {
        setFilteredCustomers(updatedCustomers.filter(c => c.status === statusFilter));
      }
      
      // 모달 닫기
      setModalOpen(false);
    } catch (err: any) {
      console.error('고객 정보 업데이트 중 오류:', err);
      alert(`고객 정보 업데이트 실패: ${err.message}`);
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
    <div className="customers-content">
      {filteredCustomers.length > 0 ? (
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>방 번호</th>
                <th>고객명</th>
                <th>보증금</th>
                <th>월 이용료</th>
                <th>입주일</th>
                <th>퇴실일</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="col-number text-center">{customer.room_no}</td>
                  <td className="col-name">{customer.name}</td>
                  <td className="col-price">{formatPrice(customer.deposit)}</td>
                  <td className="col-price">{formatPrice(customer.monthly_fee)}</td>
                  <td className="col-date">{formatDate(customer.move_in_date)}</td>
                  <td className="col-date">{formatDate(customer.move_out_date)}</td>
                  <td className={`col-status ${getStatusClass(customer.status)}`}>
                    {customer.status}
                  </td>
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