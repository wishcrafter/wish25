'use client';

import { useState } from 'react';
import { CustomerData } from '@/types/types';
import CustomerDetail from './CustomerDetail';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface WCustomerContentProps {
  statusFilter: string;
}

export default function WCustomerContent({ statusFilter }: WCustomerContentProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error } = useQuery<CustomerData[]>({
    queryKey: ['customers', statusFilter],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      return statusFilter === '전체' 
        ? data 
        : data.filter((customer: CustomerData) => customer.status === statusFilter);
    }
  });

  // 금액을 원화 형식으로 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 상태에 따른 클래스 부여
  const getStatusClass = (status: string) => {
    switch (status) {
      case '입실':
        return 'status-active';
      case '퇴실':
        return 'status-inactive';
      case '계약':
        return 'status-pending';
      default:
        return '';
    }
  };

  const handleDetailView = (customer: CustomerData) => {
    setSelectedCustomer(customer);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async (updatedCustomer: CustomerData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${updatedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      // 모달 닫기
      setSelectedCustomer(null);
      
      // 데이터 리프레시
      await queryClient.invalidateQueries({ queryKey: ['customers', statusFilter] });
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      return false;
    }
  };

  if (isLoading) {
    return <div className="loading-state">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error-state">데이터를 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="h-full">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="col-number">호실</th>
                <th className="col-text">이름</th>
                <th className="col-price">보증금</th>
                <th className="col-price">월세</th>
                <th className="col-text">상태</th>
                <th className="col-action">관리</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="col-number">{customer.room_no}</td>
                  <td className="col-text">{customer.name}</td>
                  <td className="col-price">{formatPrice(customer.deposit)}원</td>
                  <td className="col-price">{formatPrice(customer.monthly_fee)}원</td>
                  <td className="col-text">
                    <span className={`status ${getStatusClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="col-action">
                    <button 
                      onClick={() => handleDetailView(customer)}
                      className="btn btn-sm btn-outline"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 고객 상세 정보 모달 */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={handleCloseModal}
          onSave={handleSaveCustomer}
        />
      )}

      <style jsx>{`
        .col-action {
          width: 100px;
          text-align: center;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .btn-outline {
          border: 1px solid #e2e8f0;
          background-color: white;
          color: #4a5568;
        }
        
        .btn-outline:hover {
          background-color: #f7fafc;
        }

        .loading-state,
        .error-state {
          padding: 2rem;
          text-align: center;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active {
          background-color: #DEF7EC;
          color: #03543F;
        }

        .status-inactive {
          background-color: #FDE8E8;
          color: #9B1C1C;
        }

        .status-pending {
          background-color: #FEF3C7;
          color: #92400E;
        }
      `}</style>
    </div>
  );
} 