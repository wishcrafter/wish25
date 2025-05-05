'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 정기업무 월별 리스트 타입
interface MonthlyTasks {
  [key: number]: string[]; // 월별 업무 배열 (1~12월)
}

// 홈페이지 데이터 타입
interface HomeData {
  urgentTasks: string[];  // 당면업무
  routineTasks: string[]; // 일상업무 
  monthlyTasks: MonthlyTasks; // 정기업무
}

// 초기 데이터
const initialData: HomeData = {
  urgentTasks: ['새로운 당면업무를 입력하세요'],
  routineTasks: ['새로운 일상업무를 입력하세요'],
  monthlyTasks: {
    1: ['1월 정기업무를 입력하세요'],
    2: ['2월 정기업무를 입력하세요'],
    3: ['3월 정기업무를 입력하세요'],
    4: ['4월 정기업무를 입력하세요'],
    5: ['5월 정기업무를 입력하세요'],
    6: ['6월 정기업무를 입력하세요'],
    7: ['7월 정기업무를 입력하세요'],
    8: ['8월 정기업무를 입력하세요'],
    9: ['9월 정기업무를 입력하세요'],
    10: ['10월 정기업무를 입력하세요'],
    11: ['11월 정기업무를 입력하세요'],
    12: ['12월 정기업무를 입력하세요']
  }
};

// 현재 활성화된 월 (기본값: 현재 월)
const currentMonth = new Date().getMonth() + 1;

export default function Home() {
  // localStorage에서 데이터 불러오기
  const [homeData, setHomeData] = useLocalStorage<HomeData>('home-tasks', initialData);
  
  // 활성화된 월 상태
  const [activeMonth, setActiveMonth] = useState<number>(currentMonth);
  
  // 당면업무 처리 함수들
  const addUrgentTask = () => {
    setHomeData((prev: HomeData) => ({
      ...prev,
      urgentTasks: [...prev.urgentTasks, '새로운 당면업무를 입력하세요']
    }));
  };
  
  const updateUrgentTask = (index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.urgentTasks];
      newTasks[index] = value;
      return { ...prev, urgentTasks: newTasks };
    });
  };
  
  const deleteUrgentTask = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = prev.urgentTasks.filter((_: string, i: number) => i !== index);
      return { ...prev, urgentTasks: newTasks };
    });
  };
  
  // 일상업무 처리 함수들
  const addRoutineTask = () => {
    setHomeData((prev: HomeData) => ({
      ...prev,
      routineTasks: [...prev.routineTasks, '새로운 일상업무를 입력하세요']
    }));
  };
  
  const updateRoutineTask = (index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.routineTasks];
      newTasks[index] = value;
      return { ...prev, routineTasks: newTasks };
    });
  };
  
  const deleteRoutineTask = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = prev.routineTasks.filter((_: string, i: number) => i !== index);
      return { ...prev, routineTasks: newTasks };
    });
  };
  
  // 정기업무 처리 함수들
  const addMonthlyTask = (month: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      newMonthlyTasks[month] = [...(newMonthlyTasks[month] || []), `${month}월 정기업무를 입력하세요`];
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  const updateMonthlyTask = (month: number, index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      const tasks = [...(newMonthlyTasks[month] || [])];
      tasks[index] = value;
      newMonthlyTasks[month] = tasks;
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  const deleteMonthlyTask = (month: number, index: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      newMonthlyTasks[month] = newMonthlyTasks[month].filter((_: string, i: number) => i !== index);
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  return (
    <div className="page-container">
      <h1 className="page-title">업무 관리</h1>
      
      <div className="tasks-container">
        {/* 당면업무 섹션 */}
        <section className="task-section">
          <div className="section-header">
            <h2>당면업무</h2>
            <button className="add-button" onClick={addUrgentTask}>+ 추가</button>
          </div>
          <div className="tasks-list">
            {homeData.urgentTasks.map((task, index) => (
              <div key={`urgent-${index}`} className="task-item">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateUrgentTask(index, e.target.value)}
                  placeholder="당면업무를 입력하세요"
                />
                <button className="delete-button" onClick={() => deleteUrgentTask(index)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* 일상업무 섹션 */}
        <section className="task-section">
          <div className="section-header">
            <h2>일상업무</h2>
            <button className="add-button" onClick={addRoutineTask}>+ 추가</button>
          </div>
          <div className="tasks-list">
            {homeData.routineTasks.map((task, index) => (
              <div key={`routine-${index}`} className="task-item">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateRoutineTask(index, e.target.value)}
                  placeholder="일상업무를 입력하세요"
                />
                <button className="delete-button" onClick={() => deleteRoutineTask(index)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
        
        {/* 정기업무 섹션 */}
        <section className="task-section monthly-section">
          <div className="section-header">
            <h2>월별 정기업무</h2>
          </div>
          
          {/* 월 선택 탭 */}
          <div className="month-tabs">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <button 
                key={`month-${month}`}
                className={`month-tab ${month === activeMonth ? 'active' : ''}`}
                onClick={() => setActiveMonth(month)}
              >
                {month}월
              </button>
            ))}
          </div>
          
          {/* 선택된 월의 정기업무 목록 */}
          <div className="monthly-content">
            <div className="section-header">
              <h3>{activeMonth}월 정기업무</h3>
              <button className="add-button" onClick={() => addMonthlyTask(activeMonth)}>
                + 추가
              </button>
            </div>
            
            <div className="tasks-list">
              {(homeData.monthlyTasks[activeMonth] || []).map((task, index) => (
                <div key={`monthly-${activeMonth}-${index}`} className="task-item">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateMonthlyTask(activeMonth, index, e.target.value)}
                    placeholder={`${activeMonth}월 정기업무를 입력하세요`}
                  />
                  <button 
                    className="delete-button"
                    onClick={() => deleteMonthlyTask(activeMonth, index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <style jsx>{`
        .tasks-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .task-section {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .section-header h2, .section-header h3 {
          margin: 0;
        }
        
        .add-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: bold;
        }
        
        .add-button:hover {
          background-color: #388E3C;
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .task-item input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .delete-button {
          background-color: #F44336;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem;
          cursor: pointer;
        }
        
        .delete-button:hover {
          background-color: #D32F2F;
        }
        
        .monthly-section {
          margin-top: 1rem;
        }
        
        .month-tabs {
          display: flex;
          overflow-x: auto;
          gap: 0.25rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
        }
        
        .month-tab {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f5f5f5;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .month-tab.active {
          background-color: #2196F3;
          color: white;
          border-color: #2196F3;
        }
        
        .monthly-content {
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}