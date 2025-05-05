'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 업무 아이템 인터페이스
interface TaskItem {
  content: string;
  completed: boolean;
}

// 정기업무 월별 리스트 타입
interface MonthlyTasks {
  [key: number]: TaskItem[]; // 월별 업무 배열 (1~12월)
}

// 홈페이지 데이터 타입
interface HomeData {
  urgentTasks: TaskItem[];  // 당면업무
  routineTasks: TaskItem[]; // 일상업무 
  monthlyTasks: MonthlyTasks; // 정기업무
}

// 초기 데이터
const initialData: HomeData = {
  urgentTasks: [{ content: '새로운 당면업무를 입력하세요', completed: false }],
  routineTasks: [{ content: '새로운 일상업무를 입력하세요', completed: false }],
  monthlyTasks: {
    1: [{ content: '1월 정기업무를 입력하세요', completed: false }],
    2: [{ content: '2월 정기업무를 입력하세요', completed: false }],
    3: [{ content: '3월 정기업무를 입력하세요', completed: false }],
    4: [{ content: '4월 정기업무를 입력하세요', completed: false }],
    5: [{ content: '5월 정기업무를 입력하세요', completed: false }],
    6: [{ content: '6월 정기업무를 입력하세요', completed: false }],
    7: [{ content: '7월 정기업무를 입력하세요', completed: false }],
    8: [{ content: '8월 정기업무를 입력하세요', completed: false }],
    9: [{ content: '9월 정기업무를 입력하세요', completed: false }],
    10: [{ content: '10월 정기업무를 입력하세요', completed: false }],
    11: [{ content: '11월 정기업무를 입력하세요', completed: false }],
    12: [{ content: '12월 정기업무를 입력하세요', completed: false }]
  }
};

// 작업 섹션 컴포넌트
function TaskSection({
  title,
  tasks,
  onAdd,
  onUpdate,
  onToggleComplete,
  onDelete,
  onMoveUp,
  onMoveDown,
  placeholder
}: {
  title: string;
  tasks: TaskItem[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onToggleComplete: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  placeholder: string;
}) {
  return (
    <section className="task-section">
      <div className="section-header">
        <h2>{title}</h2>
        <div className="control-buttons">
          <button 
            className="control-button add-button" 
            onClick={onAdd}
            title="새 항목 추가"
          >
            추가
          </button>
          <button 
            className="control-button move-up-button" 
            onClick={() => tasks.length > 0 ? onMoveUp(0) : null}
            disabled={tasks.length <= 1}
            title="선택한 항목 위로 이동"
          >
            ↑
          </button>
          <button 
            className="control-button move-down-button" 
            onClick={() => tasks.length > 0 ? onMoveDown(0) : null}
            disabled={tasks.length <= 1}
            title="선택한 항목 아래로 이동"
          >
            ↓
          </button>
          <button 
            className="control-button delete-button" 
            onClick={() => tasks.length > 0 ? onDelete(0) : null}
            disabled={tasks.length === 0}
            title="선택한 항목 삭제"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="tasks-list">
        {tasks.map((task, index) => (
          <div key={`task-${index}`} className="task-item">
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(index)}
                className="task-checkbox"
              />
              <input
                type="text"
                value={task.content}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={placeholder}
                className={task.completed ? 'completed' : ''}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 클라이언트 컴포넌트
export default function Home() {
  // 클라이언트 사이드 렌더링임을 확인
  const [isClient, setIsClient] = useState(false);
  
  // 선택된 업무 인덱스 관리
  const [selectedUrgentTask, setSelectedUrgentTask] = useState<number | null>(null);
  const [selectedRoutineTask, setSelectedRoutineTask] = useState<number | null>(null);
  const [selectedMonthlyTask, setSelectedMonthlyTask] = useState<number | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // localStorage에서 데이터 불러오기
  const [homeData, setHomeData] = useLocalStorage<HomeData>('home-tasks', initialData);
  
  // 활성화된 월 상태
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 당면업무 처리 함수들
  const addUrgentTask = () => {
    setHomeData((prev: HomeData) => ({
      ...prev,
      urgentTasks: [...prev.urgentTasks, { content: '새로운 당면업무를 입력하세요', completed: false }]
    }));
  };
  
  const updateUrgentTask = (index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.urgentTasks];
      newTasks[index] = { ...newTasks[index], content: value };
      return { ...prev, urgentTasks: newTasks };
    });
  };
  
  const toggleUrgentTaskComplete = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.urgentTasks];
      newTasks[index] = { ...newTasks[index], completed: !newTasks[index].completed };
      return { ...prev, urgentTasks: newTasks };
    });
  };
  
  const deleteUrgentTask = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = prev.urgentTasks.filter((_, i: number) => i !== index);
      return { ...prev, urgentTasks: newTasks };
    });
    setSelectedUrgentTask(null);
  };
  
  const moveUrgentTaskUp = (index: number) => {
    if (index === 0) return; // 이미 최상위면 이동 불가
    
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.urgentTasks];
      const temp = newTasks[index];
      newTasks[index] = newTasks[index - 1];
      newTasks[index - 1] = temp;
      return { ...prev, urgentTasks: newTasks };
    });
    
    if (selectedUrgentTask === index) {
      setSelectedUrgentTask(index - 1);
    } else if (selectedUrgentTask === index - 1) {
      setSelectedUrgentTask(index);
    }
  };
  
  const moveUrgentTaskDown = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.urgentTasks];
      if (index >= newTasks.length - 1) return prev; // 이미 최하위면 이동 불가
      
      const temp = newTasks[index];
      newTasks[index] = newTasks[index + 1];
      newTasks[index + 1] = temp;
      return { ...prev, urgentTasks: newTasks };
    });
    
    if (selectedUrgentTask === index) {
      setSelectedUrgentTask(index + 1);
    } else if (selectedUrgentTask === index + 1) {
      setSelectedUrgentTask(index);
    }
  };
  
  // 일상업무 처리 함수들
  const addRoutineTask = () => {
    setHomeData((prev: HomeData) => ({
      ...prev,
      routineTasks: [...prev.routineTasks, { content: '새로운 일상업무를 입력하세요', completed: false }]
    }));
  };
  
  const updateRoutineTask = (index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.routineTasks];
      newTasks[index] = { ...newTasks[index], content: value };
      return { ...prev, routineTasks: newTasks };
    });
  };
  
  const toggleRoutineTaskComplete = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.routineTasks];
      newTasks[index] = { ...newTasks[index], completed: !newTasks[index].completed };
      return { ...prev, routineTasks: newTasks };
    });
  };
  
  const deleteRoutineTask = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = prev.routineTasks.filter((_, i: number) => i !== index);
      return { ...prev, routineTasks: newTasks };
    });
    setSelectedRoutineTask(null);
  };
  
  const moveRoutineTaskUp = (index: number) => {
    if (index === 0) return; // 이미 최상위면 이동 불가
    
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.routineTasks];
      const temp = newTasks[index];
      newTasks[index] = newTasks[index - 1];
      newTasks[index - 1] = temp;
      return { ...prev, routineTasks: newTasks };
    });
    
    if (selectedRoutineTask === index) {
      setSelectedRoutineTask(index - 1);
    } else if (selectedRoutineTask === index - 1) {
      setSelectedRoutineTask(index);
    }
  };
  
  const moveRoutineTaskDown = (index: number) => {
    setHomeData((prev: HomeData) => {
      const newTasks = [...prev.routineTasks];
      if (index >= newTasks.length - 1) return prev; // 이미 최하위면 이동 불가
      
      const temp = newTasks[index];
      newTasks[index] = newTasks[index + 1];
      newTasks[index + 1] = temp;
      return { ...prev, routineTasks: newTasks };
    });
    
    if (selectedRoutineTask === index) {
      setSelectedRoutineTask(index + 1);
    } else if (selectedRoutineTask === index + 1) {
      setSelectedRoutineTask(index);
    }
  };
  
  // 정기업무 처리 함수들
  const addMonthlyTask = (month: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      newMonthlyTasks[month] = [...(newMonthlyTasks[month] || []), { content: `${month}월 정기업무를 입력하세요`, completed: false }];
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  const updateMonthlyTask = (month: number, index: number, value: string) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      const tasks = [...(newMonthlyTasks[month] || [])];
      tasks[index] = { ...tasks[index], content: value };
      newMonthlyTasks[month] = tasks;
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  const toggleMonthlyTaskComplete = (month: number, index: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      const tasks = [...(newMonthlyTasks[month] || [])];
      tasks[index] = { ...tasks[index], completed: !tasks[index].completed };
      newMonthlyTasks[month] = tasks;
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
  };
  
  const deleteMonthlyTask = (month: number, index: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      newMonthlyTasks[month] = newMonthlyTasks[month].filter((_, i: number) => i !== index);
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
    setSelectedMonthlyTask(null);
  };
  
  const moveMonthlyTaskUp = (month: number, index: number) => {
    if (index === 0) return; // 이미 최상위면 이동 불가
    
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      const tasks = [...(newMonthlyTasks[month] || [])];
      const temp = tasks[index];
      tasks[index] = tasks[index - 1];
      tasks[index - 1] = temp;
      newMonthlyTasks[month] = tasks;
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
    
    if (selectedMonthlyTask === index) {
      setSelectedMonthlyTask(index - 1);
    } else if (selectedMonthlyTask === index - 1) {
      setSelectedMonthlyTask(index);
    }
  };
  
  const moveMonthlyTaskDown = (month: number, index: number) => {
    setHomeData((prev: HomeData) => {
      const newMonthlyTasks = { ...prev.monthlyTasks };
      const tasks = [...(newMonthlyTasks[month] || [])];
      if (index >= tasks.length - 1) return prev; // 이미 최하위면 이동 불가
      
      const temp = tasks[index];
      tasks[index] = tasks[index + 1];
      tasks[index + 1] = temp;
      newMonthlyTasks[month] = tasks;
      return { ...prev, monthlyTasks: newMonthlyTasks };
    });
    
    if (selectedMonthlyTask === index) {
      setSelectedMonthlyTask(index + 1);
    } else if (selectedMonthlyTask === index + 1) {
      setSelectedMonthlyTask(index);
    }
  };
  
  // 서버 사이드 렌더링 중에는 초기 컨텐츠만 표시
  if (!isClient) {
    return (
      <div className="page-container">
        <h1 className="page-title">업무 관리</h1>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <h1 className="page-title">업무 관리</h1>
      
      <div className="tasks-container">
        {/* 당면업무 섹션 */}
        <TaskSection
          title="당면업무"
          tasks={homeData.urgentTasks}
          onAdd={addUrgentTask}
          onUpdate={updateUrgentTask}
          onToggleComplete={toggleUrgentTaskComplete}
          onDelete={deleteUrgentTask}
          onMoveUp={moveUrgentTaskUp}
          onMoveDown={moveUrgentTaskDown}
          placeholder="당면업무를 입력하세요"
        />
        
        {/* 일상업무 섹션 */}
        <TaskSection
          title="일상업무"
          tasks={homeData.routineTasks}
          onAdd={addRoutineTask}
          onUpdate={updateRoutineTask}
          onToggleComplete={toggleRoutineTaskComplete}
          onDelete={deleteRoutineTask}
          onMoveUp={moveRoutineTaskUp}
          onMoveDown={moveRoutineTaskDown}
          placeholder="일상업무를 입력하세요"
        />
        
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
              <div className="control-buttons">
                <button 
                  className="control-button add-button" 
                  onClick={() => addMonthlyTask(activeMonth)}
                  title="새 항목 추가"
                >
                  추가
                </button>
                <button 
                  className="control-button move-up-button" 
                  onClick={() => homeData.monthlyTasks[activeMonth]?.length > 0 
                    ? moveMonthlyTaskUp(activeMonth, 0) 
                    : null}
                  disabled={!homeData.monthlyTasks[activeMonth] || homeData.monthlyTasks[activeMonth].length <= 1}
                  title="선택한 항목 위로 이동"
                >
                  ↑
                </button>
                <button 
                  className="control-button move-down-button" 
                  onClick={() => homeData.monthlyTasks[activeMonth]?.length > 0 
                    ? moveMonthlyTaskDown(activeMonth, 0) 
                    : null}
                  disabled={!homeData.monthlyTasks[activeMonth] || homeData.monthlyTasks[activeMonth].length <= 1}
                  title="선택한 항목 아래로 이동"
                >
                  ↓
                </button>
                <button 
                  className="control-button delete-button" 
                  onClick={() => homeData.monthlyTasks[activeMonth]?.length > 0 
                    ? deleteMonthlyTask(activeMonth, 0) 
                    : null}
                  disabled={!homeData.monthlyTasks[activeMonth] || homeData.monthlyTasks[activeMonth].length === 0}
                  title="선택한 항목 삭제"
                >
                  삭제
                </button>
              </div>
            </div>
            
            <div className="tasks-list">
              {(homeData.monthlyTasks[activeMonth] || []).map((task, index) => (
                <div key={`monthly-${activeMonth}-${index}`} className="task-item">
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleMonthlyTaskComplete(activeMonth, index)}
                      className="task-checkbox"
                    />
                    <input
                      type="text"
                      value={task.content}
                      onChange={(e) => updateMonthlyTask(activeMonth, index, e.target.value)}
                      placeholder={`${activeMonth}월 정기업무를 입력하세요`}
                      className={task.completed ? 'completed' : ''}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <style jsx>{`
        .loading {
          padding: 2rem;
          text-align: center;
          font-size: 1.2rem;
          color: #666;
        }
        
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
        
        .control-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .control-button {
          border: none;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-weight: bold;
          color: white;
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .add-button {
          background-color: #4CAF50;
        }
        
        .add-button:hover:not(:disabled) {
          background-color: #388E3C;
        }
        
        .move-up-button, .move-down-button {
          background-color: #2196F3;
        }
        
        .move-up-button:hover:not(:disabled), .move-down-button:hover:not(:disabled) {
          background-color: #0b7dda;
        }
        
        .delete-button {
          background-color: #F44336;
        }
        
        .delete-button:hover:not(:disabled) {
          background-color: #D32F2F;
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .task-item {
          padding: 0.5rem;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: #fafafa;
        }
        
        .task-item:hover {
          background-color: #f0f0f0;
        }
        
        .task-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .task-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        
        .task-content input[type="text"] {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .task-content input[type="text"].completed {
          text-decoration: line-through;
          color: #888;
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