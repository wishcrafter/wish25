'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '../../../../utils/supabase-client-api';

interface RoomData {
  room_no: number;
  width: number;
  depth: number;
  area_sqm: number;
  area_py: number;
  has_window: boolean;
  base_price: number;
  discount_3mo: number;
  discount_6mo: number;
  discount_12mo: number;
}

// 컴포넌트 Props 인터페이스 추가
interface WRoomsContentProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
}

const columnMapping: { [key: string]: string } = {
  room_no: '방 번호',
  width: '너비(m)',
  depth: '깊이(m)',
  area_sqm: '면적(㎡)',
  area_py: '면적(평)',
  has_window: '창문',
  base_price: '기본 요금',
  discount_3mo: '3개월 할인가',
  discount_6mo: '6개월 할인가',
  discount_12mo: '12개월 할인가'
};

// 컬럼별 스타일 매핑
const columnStyles: { [key: string]: string } = {
  room_no: 'col-number text-center' ,
  width: 'col-number',
  depth: 'col-number',
  area_sqm: 'col-number',
  area_py: 'col-number',
  has_window: 'col-status',
  base_price: 'col-price',
  discount_3mo: 'col-price',
  discount_6mo: 'col-price',
  discount_12mo: 'col-price'
};

export default function WRoomsContent({ onLoadingChange, onErrorChange }: WRoomsContentProps) {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        // 이미 데이터가 있는 경우 로딩 표시 안함
        if (rooms.length === 0) {
          setLoading(true);
        }
        
        const result = await fetchData('w_rooms', {
          select: '*',
          orderBy: 'room_no',
          ascending: true
        });
        
        if (!result.success) {
          throw new Error(result.message);
        }

        setRooms(result.data || []);
      } catch (err: any) {
        console.error('Error fetching 스튜디오 방 정보:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  // 부모 컴포넌트에 로딩 상태 전달
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // 부모 컴포넌트에 에러 상태 전달
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  // 요금을 원화 형식으로 포맷팅
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 숫자 포맷팅 (소수점 2자리까지)
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  if (loading && rooms.length === 0) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <div>
      {loading && rooms.length > 0 && (
        <div className="minimal-loading-indicator">
          <div className="loading-spinner-small"></div>
        </div>
      )}
      {rooms.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {(Object.entries(columnMapping) as [keyof typeof columnMapping, string][]).map(([key, label]) => (
                  <th key={key}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.room_no}>
                  {(Object.keys(columnMapping) as (keyof typeof columnMapping)[]).map((key) => (
                    <td key={key} className={columnStyles[key]}>
                      {key === 'base_price' || key === 'discount_3mo' || key === 'discount_6mo' || key === 'discount_12mo' 
                        ? formatPrice(room[key as keyof RoomData] as number) 
                      : key === 'has_window'
                        ? <span className={`has-window-${room[key as keyof RoomData]}`}>
                            {room[key as keyof RoomData] ? '있음' : '없음'}
                          </span>
                      : key === 'width' || key === 'depth' || key === 'area_sqm' || key === 'area_py'
                        ? formatNumber(room[key as keyof RoomData] as number)
                      : key === 'room_no'
                        ? <strong>{room[key as keyof RoomData]}</strong>
                      : room[key as keyof RoomData]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          등록된 방이 없습니다.
        </div>
      )}
    </div>
  );
} 