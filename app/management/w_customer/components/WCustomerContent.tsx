'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import SimpleModal from './SimpleModal';
import CustomerDetailModal from './CustomerDetailModal';

interface WCustomerContentProps {
  statusFilter: string;
  onStatusFilterChange?: (status: string) => void;
  onCustomerCreated: () => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string | null) => void;
}

interface CustomerData {
  id: number;
  room_no: number | null;
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
  created_at?: string;
  updated_at?: string;
}

export default function WCustomerContent({ 
  statusFilter, 
  onCustomerCreated, 
  onLoadingChange, 
  onErrorChange 
}: WCustomerContentProps) {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  
  // 등록 모달 관련 상태 추가
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoomNo, setSelectedRoomNo] = useState<number | undefined>(undefined);
  
  // 상세 정보 모달 관련 상태
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 모달 열기 함수
  const openModal = (roomNo?: number) => {
    setSelectedRoomNo(roomNo);
    setModalOpen(true);
  };

  // 고객 생성 완료 핸들러
  const handleCustomerCreated = () => {
    setModalOpen(false);
    loadCustomers();
    onCustomerCreated();
  };

  // 간단한 데이터 로딩 함수
  const loadCustomers = async () => {
    try {
      // 로딩 상태 업데이트하지 않고 바로 데이터 조회 (게이지 제거)
      const { data, error } = await supabase
        .from('w_customers')
        .select('*')
        .order('room_no', { ascending: true });

      if (error) throw error;
      
      setCustomers(data || []);
    } catch (err: any) {
      console.error('데이터 로딩 오류:', err.message);
      onErrorChange(err.message);
    }
  };

  // 방 번호별 고객 데이터 매핑
  const roomCustomerMap = useMemo(() => {
    const map: Record<number, CustomerData | null> = {};
    
    // 모든 방을 null로 초기화
    for (let i = 1; i <= 15; i++) {
      map[i] = null;
    }
    
    // 입실 상태인 고객만 매핑
    const activeCustomers = customers.filter(c => c.status === '입실');
    activeCustomers.forEach(customer => {
      if (customer.room_no !== null && customer.room_no >= 1 && customer.room_no <= 15) {
        map[customer.room_no] = customer;
      }
    });
    
    return map;
  }, [customers]);

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadCustomers();
  }, []);

  // 고객 등록 후 새로고침
  useEffect(() => {
    loadCustomers();
  }, [onCustomerCreated]);

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  // 금액 포맷팅
  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '입실':
        return 'bg-green-100 text-green-800';
      case '퇴실':
        return 'bg-red-100 text-red-800';
      case '예약':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 필터링된 데이터 준비
  const filteredData = useMemo(() => {
    if (statusFilter === '입실') {
      // 1~15번 방 모두 표시, 공실도 표시
      const allRooms = [];
      for (let i = 1; i <= 15; i++) {
        const customer = roomCustomerMap[i];
        allRooms.push({
          roomNo: i,
          customer: customer,
          isOccupied: customer !== null
        });
      }
      return allRooms;
    } else {
      // 다른 필터는 해당 상태의 고객만 표시
      return statusFilter === '전체'
        ? customers.map(c => ({ roomNo: c.room_no, customer: c, isOccupied: true }))
        : customers
            .filter(c => c.status === statusFilter)
            .map(c => ({ roomNo: c.room_no, customer: c, isOccupied: true }));
    }
  }, [statusFilter, customers, roomCustomerMap]);

  // 고객 상세 정보 열기
  const openDetailModal = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setDetailModalOpen(true);
    }
  };

  return (
    <>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">방번호</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">이름</th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">보증금</th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">월세</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">입주일</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">퇴실일</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">상태</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr 
                  key={item.isOccupied ? `customer-${item.customer?.id}` : `room-${item.roomNo}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-gray-900">{item.roomNo || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-900">
                    {item.isOccupied ? item.customer?.name : <span className="italic text-gray-400">공실</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 text-right">
                    {item.isOccupied ? formatPrice(item.customer?.deposit || 0) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 text-right">
                    {item.isOccupied ? formatPrice(item.customer?.monthly_fee || 0) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 text-center">
                    {item.isOccupied && item.customer ? formatDate(item.customer.move_in_date) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 text-center">
                    {item.isOccupied && item.customer ? formatDate(item.customer.move_out_date) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-center">
                    {item.isOccupied ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(item.customer?.status || '')}`}>
                        {item.customer?.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        공실
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm">
                    {item.isOccupied ? (
                      <button
                        type="button"
                        onClick={() => item.customer && openDetailModal(item.customer.id)}
                        className="font-medium text-blue-600 hover:text-blue-900"
                      >
                        상세보기
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openModal(item.roomNo as number)}
                        className="font-medium text-green-600 hover:text-green-900"
                      >
                        등록하기
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                  {statusFilter === '전체' 
                    ? '등록된 고객이 없습니다.' 
                    : `'${statusFilter}' 상태인 고객이 없습니다.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 등록 모달 */}
      <SimpleModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onCustomerCreated={handleCustomerCreated}
        initialRoomNo={selectedRoomNo}
      />

      {/* 고객 상세 모달 */}
      {selectedCustomer && (
        <CustomerDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </>
  );
} 