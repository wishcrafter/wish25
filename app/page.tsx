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
  urgentTasks: [{ content: '', completed: false }],
  routineTasks: [{ content: '', completed: false }],
  monthlyTasks: {
    1: [{ content: '', completed: false }],
    2: [{ content: '', completed: false }],
    3: [{ content: '', completed: false }],
    4: [{ content: '', completed: false }],
    5: [{ content: '', completed: false }],
    6: [{ content: '', completed: false }],
    7: [{ content: '', completed: false }],
    8: [{ content: '', completed: false }],
    9: [{ content: '', completed: false }],
    10: [{ content: '', completed: false }],
    11: [{ content: '', completed: false }],
    12: [{ content: '', completed: false }]
  }
};

// 작업 셀 컴포넌트
function TaskCell({
  title,
  tasks,
  onAdd,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  placeholder
}: {
  title: string;
  tasks: TaskItem[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  placeholder: string;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  return (
    <div className="summary-card">
      <div className="flex items-center mb-4">
        <span className="font-semibold text-base flex-1">{title}</span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={onAdd}
          title="새 항목 추가"
        >
          + 추가
        </button>
      </div>
      <div>
        {tasks.map((task, index) => (
          <div key={`task-${index}`} className="task-row-flex">
            <input
              type="text"
              value={task.content || ''}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={focusedIndex !== index && (!task.content || task.content === 'null') ? placeholder : ''}
              className="form-input"
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
            />
            <div className="task-controls-horizontal">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                title="위로 이동"
              >▲</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveDown(index)}
                disabled={index === tasks.length - 1}
                title="아래로 이동"
              >▼</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onDelete(index)}
                title="항목 삭제"
              >삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 월별 작업 셀 컴포넌트
function MonthlyTaskCell({
  title,
  activeMonth,
  monthlyTasks,
  onAdd,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onChangeMonth
}: {
  title: string;
  activeMonth: number;
  monthlyTasks: MonthlyTasks;
  onAdd: (month: number) => void;
  onUpdate: (month: number, index: number, value: string) => void;
  onDelete: (month: number, index: number) => void;
  onMoveUp: (month: number, index: number) => void;
  onMoveDown: (month: number, index: number) => void;
  onChangeMonth: (month: number) => void;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  return (
    <div className="summary-card">
      <div className="flex items-center mb-4">
        <span className="font-semibold text-base flex-1">{title}</span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onAdd(activeMonth)}
          title="새 항목 추가"
        >
          + 추가
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-1 mt-6">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
          <button 
            key={`month-${month}`}
            className={`btn btn-outline btn-sm${month === activeMonth ? ' btn-primary text-white' : ''}`}
            onClick={() => onChangeMonth(month)}
          >
            {month}월
          </button>
        ))}
      </div>
      <div>
        {(monthlyTasks[activeMonth] || []).map((task, index) => (
          <div key={`monthly-${activeMonth}-${index}`} className="task-row-flex">
            <input
              type="text"
              value={task.content || ''}
              onChange={(e) => onUpdate(activeMonth, index, e.target.value)}
              placeholder={focusedIndex !== index && (!task.content || task.content === 'null') ? `${activeMonth}월 정기업무를 입력하세요` : ''}
              className="form-input"
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
            />
            <div className="task-controls-horizontal">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveUp(activeMonth, index)}
                disabled={index === 0}
                title="위로 이동"
              >▲</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveDown(activeMonth, index)}
                disabled={index === monthlyTasks[activeMonth].length - 1}
                title="아래로 이동"
              >▼</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onDelete(activeMonth, index)}
                title="항목 삭제"
              >삭제</button>
            </div>
          </div>
        ))}
      </div>
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
      urgentTasks: [...prev.urgentTasks, { content: '', completed: false }]
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
      routineTasks: [...prev.routineTasks, { content: '', completed: false }]
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
      newMonthlyTasks[month] = [...(newMonthlyTasks[month] || []), { content: '', completed: false }];
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
    <div className="notebook-outer">
      <div className="notebook-container">
        <div className="notebook-cells">
          {/* 당면업무 셀 */}
          <TaskCell
            title="당면업무"
            tasks={homeData.urgentTasks}
            onAdd={addUrgentTask}
            onUpdate={updateUrgentTask}
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
            onDelete={deleteRoutineTask}
            onMoveUp={moveRoutineTaskUp}
            onMoveDown={moveRoutineTaskDown}
            placeholder="일상업무를 입력하세요"
          />
          
          {/* 월별 정기업무 셀 */}
          <MonthlyTaskCell
            title="월별 정기업무"
            activeMonth={activeMonth}
            monthlyTasks={homeData.monthlyTasks}
            onAdd={addMonthlyTask}
            onUpdate={updateMonthlyTask}
            onDelete={deleteMonthlyTask}
            onMoveUp={moveMonthlyTaskUp}
            onMoveDown={moveMonthlyTaskDown}
            onChangeMonth={setActiveMonth}
          />
        </div>
      </div>
    </div>
  );
}