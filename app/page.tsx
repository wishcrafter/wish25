'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  // 월별 주차 데이터 (1~12월, 각 월마다 1~4주)
  // 초기 데이터는 비어있는 상태로 시작
  const [scheduleData, setScheduleData] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 월 이름 배열
  const months = [
    '1월', '2월', '3월', '4월',
    '5월', '6월', '7월', '8월',
    '9월', '10월', '11월', '12월'
  ];

  // 주차 이름 배열
  const weeks = ['1주', '2주', '3주', '4주'];

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem('scheduleData');
    if (savedData) {
      try {
        setScheduleData(JSON.parse(savedData));
      } catch (error) {
        console.error('저장된 데이터를 불러오는 중 오류가 발생했습니다:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
    }
  }, [scheduleData, isLoading]);

  // 셀 내용 변경 핸들러
  const handleCellChange = (month: string, week: string, value: string) => {
    const cellKey = `${month}-${week}`;
    setScheduleData(prevData => ({
      ...prevData,
      [cellKey]: value
    }));
  };

  // 모든 데이터 지우기
  const handleClearAll = () => {
    if (window.confirm('모든 일정 데이터를 지우시겠습니까?')) {
      setScheduleData({});
    }
  };

  // 셀 값 가져오기
  const getCellValue = (month: string, week: string) => {
    const cellKey = `${month}-${week}`;
    return scheduleData[cellKey] || '';
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">연간 일정표</h1>
      <p className="schedule-subtitle">각 셀을 클릭하여 일정을 입력하세요. 입력된 내용은 자동으로 저장됩니다.</p>
      
      <div className="controls">
        <button 
          onClick={handleClearAll}
          className="clear-button"
        >
          모든 데이터 지우기
        </button>
      </div>

      <div className="schedule-grid-wrapper">
        <div className="schedule-grid">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="empty-cell"></th>
                {months.map(month => (
                  <th key={month} className="header-cell">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map(week => (
                <tr key={week} className="schedule-row">
                  <td className="week-cell">{week}</td>
                  {months.map(month => (
                    <td key={`${month}-${week}`} className="schedule-cell">
                      <textarea
                        value={getCellValue(month, week)}
                        onChange={(e) => handleCellChange(month, week, e.target.value)}
                        placeholder=""
                        className="cell-textarea"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .schedule-container {
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
        }
        
        .schedule-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #2563eb;
        }
        
        .schedule-subtitle {
          text-align: center;
          margin-bottom: 2rem;
          color: #64748b;
        }

        .controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .clear-button {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }

        .clear-button:hover {
          background-color: #dc2626;
        }
        
        .schedule-grid-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        
        .schedule-grid {
          width: 100%;
          min-width: 850px; /* 최소 너비 설정 - 일반적인 화면에서 스크롤 방지 */
          border-radius: 6px;
          overflow: hidden;
        }
        
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed; /* 테이블 셀 너비 고정 */
        }
        
        .header-cell, .week-cell, .schedule-cell {
          border: 1px solid #e2e8f0;
        }
        
        .header-cell, .week-cell {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: center;
          padding: 12px 8px;
        }
        
        .empty-cell {
          width: 80px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        
        .week-cell {
          width: 80px;
        }
        
        .schedule-cell {
          position: relative;
          height: 80px;
          vertical-align: top;
          padding: 0;
        }
        
        .cell-textarea {
          width: 100%;
          height: 100%;
          min-height: 80px;
          padding: 8px;
          border: none;
          resize: none;
          font-family: inherit;
          background-color: transparent;
          color: #334155;
          box-sizing: border-box;
        }
        
        .cell-textarea:focus {
          outline: none;
          background-color: #f0f9ff;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}