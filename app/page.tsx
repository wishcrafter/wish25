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

// 작업 셀 컴포넌트
function TaskCell({
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
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="task-cell">
      <div className="cell-header">
        <div className="cell-title-area">
          <button 
            className="expand-button" 
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "셀 접기" : "셀 펼치기"}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <h2>{title}</h2>
        </div>
        
        <div className="cell-controls">
          <button 
            className="cell-run-button" 
            onClick={onAdd}
            title="새 항목 추가"
          >
            + 추가
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="cell-content">
          <div className="tasks-list">
            {tasks.map((task, index) => (
              <div key={`task-${index}`} className="task-item">
                <div className="task-controls">
                  <button 
                    className="task-button move-up-button" 
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    title="위로 이동"
                  >
                    ↑
                  </button>
                  <button 
                    className="task-button move-down-button" 
                    onClick={() => onMoveDown(index)}
                    disabled={index === tasks.length - 1}
                    title="아래로 이동"
                  >
                    ↓
                  </button>
                  <button 
                    className="task-button delete-button" 
                    onClick={() => onDelete(index)}
                    title="항목 삭제"
                  >
                    ×
                  </button>
                </div>
                
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
        </div>
      )}
    </div>
  );
}

// 월별 작업 셀 컴포넌트
function MonthlyTaskCell({
  activeMonth,
  monthlyTasks,
  onAdd,
  onUpdate,
  onToggleComplete,
  onDelete,
  onMoveUp,
  onMoveDown,
  onChangeMonth
}: {
  activeMonth: number;
  monthlyTasks: MonthlyTasks;
  onAdd: (month: number) => void;
  onUpdate: (month: number, index: number, value: string) => void;
  onToggleComplete: (month: number, index: number) => void;
  onDelete: (month: number, index: number) => void;
  onMoveUp: (month: number, index: number) => void;
  onMoveDown: (month: number, index: number) => void;
  onChangeMonth: (month: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="task-cell">
      <div className="cell-header">
        <div className="cell-title-area">
          <button 
            className="expand-button" 
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "셀 접기" : "셀 펼치기"}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <h2>월별 정기업무</h2>
        </div>
        
        <div className="cell-controls">
          <button 
            className="cell-run-button" 
            onClick={() => onAdd(activeMonth)}
            title="새 항목 추가"
          >
            + 추가
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="cell-content">
          <div className="month-tabs">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <button 
                key={`month-${month}`}
                className={`month-tab ${month === activeMonth ? 'active' : ''}`}
                onClick={() => onChangeMonth(month)}
              >
                {month}월
              </button>
            ))}
          </div>
          
          <div className="tasks-list">
            {(monthlyTasks[activeMonth] || []).map((task, index) => (
              <div key={`monthly-${activeMonth}-${index}`} className="task-item">
                <div className="task-controls">
                  <button 
                    className="task-button move-up-button" 
                    onClick={() => onMoveUp(activeMonth, index)}
                    disabled={index === 0}
                    title="위로 이동"
                  >
                    ↑
                  </button>
                  <button 
                    className="task-button move-down-button" 
                    onClick={() => onMoveDown(activeMonth, index)}
                    disabled={index === monthlyTasks[activeMonth].length - 1}
                    title="아래로 이동"
                  >
                    ↓
                  </button>
                  <button 
                    className="task-button delete-button" 
                    onClick={() => onDelete(activeMonth, index)}
                    title="항목 삭제"
                  >
                    ×
                  </button>
                </div>
                
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleComplete(activeMonth, index)}
                    className="task-checkbox"
                  />
                  <input
                    type="text"
                    value={task.content}
                    onChange={(e) => onUpdate(activeMonth, index, e.target.value)}
                    placeholder={`${activeMonth}월 정기업무를 입력하세요`}
                    className={task.completed ? 'completed' : ''}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
      <div className="notebook-container">
        <h1 className="notebook-title">업무 관리 노트북</h1>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }
  
  return (
    <div className="notebook-container">
      <h1 className="notebook-title">업무 관리 노트북</h1>
      
      <div className="notebook-cells">
        {/* 당면업무 셀 */}
        <TaskCell
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
        
        {/* 일상업무 셀 */}
        <TaskCell
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
        
        {/* 월별 정기업무 셀 */}
        <MonthlyTaskCell
          activeMonth={activeMonth}
          monthlyTasks={homeData.monthlyTasks}
          onAdd={addMonthlyTask}
          onUpdate={updateMonthlyTask}
          onToggleComplete={toggleMonthlyTaskComplete}
          onDelete={deleteMonthlyTask}
          onMoveUp={moveMonthlyTaskUp}
          onMoveDown={moveMonthlyTaskDown}
          onChangeMonth={setActiveMonth}
        />
      </div>
      
      <style jsx>{`
        .notebook-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .notebook-title {
          font-size: 2rem;
          text-align: center;
          color: #303846;
          margin-bottom: 2rem;
          font-weight: 600;
          border-bottom: 1px solid #e1e4e8;
          padding-bottom: 1rem;
        }
        
        .notebook-cells {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .task-cell {
          background-color: white;
          border: 1px solid #e1e4e8;
          border-left: 4px solid #2188ff;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: #f6f8fa;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .cell-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cell-title-area h2 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #24292e;
        }
        
        .expand-button {
          background: none;
          border: none;
          color: #586069;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .expand-button:hover {
          color: #0366d6;
        }
        
        .cell-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .cell-run-button {
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .cell-run-button:hover {
          background-color: #22863a;
        }
        
        .cell-content {
          padding: 1rem;
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          background-color: #fafbfc;
        }
        
        .task-controls {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .task-button {
          background: none;
          border: 1px solid #e1e4e8;
          border-radius: 3px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
          color: #586069;
        }
        
        .task-button:hover:not(:disabled) {
          background-color: #f6f8fa;
          color: #0366d6;
        }
        
        .task-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .delete-button:hover:not(:disabled) {
          color: #cb2431;
          border-color: #cb2431;
          background-color: #ffeef0;
        }
        
        .task-content {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 0.75rem;
        }
        
        .task-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .task-content input[type="text"] {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e1e4e8;
          border-radius: 3px;
          font-size: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        }
        
        .task-content input[type="text"]:focus {
          border-color: #0366d6;
          box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
          outline: none;
        }
        
        .task-content input[type="text"].completed {
          text-decoration: line-through;
          color: #6a737d;
        }
        
        .month-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        
        .month-tab {
          padding: 0.5rem 1rem;
          border: 1px solid #e1e4e8;
          border-radius: 3px;
          background-color: #f6f8fa;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .month-tab.active {
          background-color: #0366d6;
          color: white;
          border-color: #0366d6;
        }
        
        .month-tab:hover:not(.active) {
          background-color: #eff3f6;
        }
        
        .loading {
          padding: 2rem;
          text-align: center;
          font-size: 1.2rem;
          color: #586069;
        }
        
        @media (max-width: 768px) {
          .notebook-container {
            padding: 1rem;
          }
          
          .cell-title-area h2 {
            font-size: 1.1rem;
          }
          
          .month-tabs {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}