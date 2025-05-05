import { useState, useEffect } from 'react';

// localStorage를 사용하는 커스텀 훅
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 초기 상태는 initialValue로 설정 (서버 사이드 렌더링과 일치)
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // 클라이언트 사이드에서만 localStorage에서 값을 가져옴
  useEffect(() => {
    try {
      // localStorage에서 값 가져오기
      const item = localStorage.getItem(key);
      // 값이 있으면 파싱해서 상태 업데이트
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('로컬 스토리지에서 값을 불러오는 중 오류 발생:', error);
    }
  }, [key]);
  
  // 값 업데이트 함수
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // 함수인 경우 이전 값을 인자로 전달
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 상태 업데이트
      setStoredValue(valueToStore);
      
      // 브라우저 환경에서만 localStorage 업데이트
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('로컬 스토리지에 값을 저장하는 중 오류 발생:', error);
    }
  };

  // 같은 키로 다른 탭에서 변경된 경우 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };
    
    // storage 이벤트 리스너 추가
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
} 