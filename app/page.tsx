'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// 업무 아이템 인터페이스
interface TaskItem {
  id?: number;
  content: string;
  completed: boolean;
  isDirty?: boolean; // 변경 여부를 추적하는 플래그
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
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  placeholder
}: {
  title: string;
  tasks: TaskItem[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onSave: (index: number) => void;
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
              className={`form-input ${task.isDirty ? 'border-yellow-500' : ''}`}
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
                className={`btn ${task.isDirty ? 'btn-warning' : 'btn-success'} btn-sm`}
                onClick={() => onSave(index)}
                title="저장"
                disabled={!task.isDirty}
              >저장</button>
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
  onSave,
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
  onSave: (month: number, index: number) => void;
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
              className={`form-input ${task.isDirty ? 'border-yellow-500' : ''}`}
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
                className={`btn ${task.isDirty ? 'btn-warning' : 'btn-success'} btn-sm`}
                onClick={() => onSave(activeMonth, index)}
                title="저장"
                disabled={!task.isDirty}
              >저장</button>
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
  const [isClient, setIsClient] = useState(false);
  const [urgentTasks, setUrgentTasks] = useState<TaskItem[]>([]);
  const [routineTasks, setRoutineTasks] = useState<TaskItem[]>([]);
  const [monthlyTasks, setMonthlyTasks] = useState<MonthlyTasks>(() => {
    const init: MonthlyTasks = {};
    for (let m = 1; m <= 12; m++) init[m] = [];
    return init;
  });
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1);

  // 데이터 로드 함수
  const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_list')
        .select('id, group, todo, month');
      
      if (error) {
        console.error('데이터 로드 오류:', error);
        return;
      }
      
      // 데이터가 없으면 빈 목록 설정
      if (!data || data.length === 0) {
        setUrgentTasks([]);
        setRoutineTasks([]);
        
        const emptyMonthly: MonthlyTasks = {};
        for (let m = 1; m <= 12; m++) emptyMonthly[m] = [];
        setMonthlyTasks(emptyMonthly);
        
        return;
      }
      
      const rows = data as { id: number; group: string; todo: string; month: number }[];
      
      // 각 그룹별 데이터 필터링
      const urgent = rows
        .filter(r => r.group === '당면업무')
        .map(r => ({ id: r.id, content: r.todo, completed: false }));
      
      const routine = rows
        .filter(r => r.group === '일상업무')
        .map(r => ({ id: r.id, content: r.todo, completed: false }));
      
      // 월별 정기업무 데이터 구성
      const monthly: MonthlyTasks = {};
      for (let m = 1; m <= 12; m++) {
        monthly[m] = rows
          .filter(r => r.group === '정기업무' && r.month === m)
          .map(r => ({ id: r.id, content: r.todo, completed: false }));
      }
      
      // 상태 업데이트
      setUrgentTasks(urgent.length > 0 ? urgent : []);
      setRoutineTasks(routine.length > 0 ? routine : []);
      setMonthlyTasks(monthly);
      
      console.log('데이터 로드 완료', { 
        urgentCount: urgent.length, 
        routineCount: routine.length, 
        monthlyCount: Object.values(monthly).flat().length 
      });
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadTodos();
  }, []);

  // 일반 업무 추가 핸들러
  const handleAddTask = async (group: string, month?: number) => {
    try {
      const monthValue = group === '정기업무' ? month || activeMonth : null;
      
      const { data, error } = await supabase
        .from('todo_list')
        .insert([{ 
          group, 
          todo: '', 
          month: monthValue 
        }])
        .select();
      
      if (error) {
        console.error('항목 추가 오류:', error);
      } else {
        console.log('항목 추가 성공:', data);
        await loadTodos();
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 업무 수정 핸들러
  const handleUpdateTask = async (group: string, index: number, value: string, month?: number) => {
    try {
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('id')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: existingData, error: fetchError } = await query;

      if (fetchError) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      if (existingData && existingData[index]) {
        const { error: updateError } = await supabase
          .from('todo_list')
          .update({ todo: value })
          .eq('id', existingData[index].id);

        if (updateError) console.error('업데이트 오류:', updateError);
        else await loadTodos();
      } else {
        console.log('업데이트할 항목을 찾을 수 없음', { group, index, month });
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 업무 삭제 핸들러
  const handleDeleteTask = async (group: string, index: number, month?: number) => {
    try {
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('id')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: existingData, error: fetchError } = await query;

      if (fetchError) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      if (existingData && existingData[index]) {
        const { error: deleteError } = await supabase
          .from('todo_list')
          .delete()
          .eq('id', existingData[index].id);

        if (deleteError) console.error('삭제 오류:', deleteError);
        else await loadTodos();
      } else {
        console.log('삭제할 항목을 찾을 수 없음', { group, index, month });
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 업무 순서 변경 핸들러 (위로)
  const handleMoveUp = async (group: string, index: number, month?: number) => {
    if (index === 0) return;
    
    try {
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('id, todo')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: existingData, error: fetchError } = await query;

      if (fetchError || !existingData || existingData.length < 2) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      const currentId = existingData[index].id;
      const prevId = existingData[index - 1].id;
      const currentTodo = existingData[index].todo;
      const prevTodo = existingData[index - 1].todo;

      const { error: updateError } = await supabase
        .from('todo_list')
        .upsert([
          { id: currentId, todo: prevTodo },
          { id: prevId, todo: currentTodo }
        ]);

      if (updateError) console.error('위치 변경 오류:', updateError);
      else await loadTodos();
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 업무 순서 변경 핸들러 (아래로)
  const handleMoveDown = async (group: string, index: number, month?: number) => {
    try {
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('id, todo')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: existingData, error: fetchError } = await query;

      if (fetchError || !existingData || index >= existingData.length - 1) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      const currentId = existingData[index].id;
      const nextId = existingData[index + 1].id;
      const currentTodo = existingData[index].todo;
      const nextTodo = existingData[index + 1].todo;

      const { error: updateError } = await supabase
        .from('todo_list')
        .upsert([
          { id: currentId, todo: nextTodo },
          { id: nextId, todo: currentTodo }
        ]);

      if (updateError) console.error('위치 변경 오류:', updateError);
      else await loadTodos();
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 로컬 업무 업데이트 핸들러
  const handleLocalUpdate = (group: string, index: number, value: string, month?: number) => {
    try {
      if (group === '당면업무') {
        setUrgentTasks(prev => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], content: value, isDirty: true };
          }
          return updated;
        });
      } else if (group === '일상업무') {
        setRoutineTasks(prev => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], content: value, isDirty: true };
          }
          return updated;
        });
      } else if (group === '정기업무' && month) {
        setMonthlyTasks(prev => {
          const updated = { ...prev };
          if (updated[month] && updated[month][index]) {
            updated[month] = [...updated[month]];
            updated[month][index] = { ...updated[month][index], content: value, isDirty: true };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('로컬 상태 업데이트 오류:', error);
    }
  };

  // 업무 저장 핸들러
  const handleSaveTask = async (group: string, index: number, month?: number) => {
    try {
      let content = '';
      
      // 해당 그룹과 인덱스의 콘텐츠 가져오기
      if (group === '당면업무' && urgentTasks[index]) {
        content = urgentTasks[index].content;
      } else if (group === '일상업무' && routineTasks[index]) {
        content = routineTasks[index].content;
      } else if (group === '정기업무' && month && monthlyTasks[month][index]) {
        content = monthlyTasks[month][index].content;
      }
      
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('id')
        .eq('group', group)
        .order('id');
      
      // 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        query = query.is('month', null);
      }
      
      const { data: existingData, error: fetchError } = await query;

      if (fetchError) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      if (existingData && existingData[index]) {
        const { error: updateError } = await supabase
          .from('todo_list')
          .update({ todo: content })
          .eq('id', existingData[index].id);

        if (updateError) {
          console.error('저장 오류:', updateError);
        } else {
          console.log('저장 성공:', { group, index, content });
          
          // isDirty 플래그 초기화
          if (group === '당면업무') {
            setUrgentTasks(prev => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = { ...updated[index], isDirty: false };
              }
              return updated;
            });
          } else if (group === '일상업무') {
            setRoutineTasks(prev => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = { ...updated[index], isDirty: false };
              }
              return updated;
            });
          } else if (group === '정기업무' && month) {
            setMonthlyTasks(prev => {
              const updated = { ...prev };
              if (updated[month] && updated[month][index]) {
                updated[month] = [...updated[month]];
                updated[month][index] = { ...updated[month][index], isDirty: false };
              }
              return updated;
            });
          }
        }
      } else {
        console.log('저장할 항목을 찾을 수 없음', { group, index, month });
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  if (!isClient) {
    return <div className="notebook-outer"><div className="notebook-container">로딩 중...</div></div>;
  }

  return (
    <div className="notebook-outer">
      <div className="notebook-container">
        <div className="notebook-cells">
          <TaskCell
            title="당면업무"
            tasks={urgentTasks}
            onAdd={() => handleAddTask('당면업무')}
            onUpdate={(index, value) => handleLocalUpdate('당면업무', index, value)}
            onSave={(index) => handleSaveTask('당면업무', index)}
            onDelete={(index) => handleDeleteTask('당면업무', index)}
            onMoveUp={(index) => handleMoveUp('당면업무', index)}
            onMoveDown={(index) => handleMoveDown('당면업무', index)}
            placeholder="당면업무를 입력하세요"
          />
          <TaskCell
            title="일상업무"
            tasks={routineTasks}
            onAdd={() => handleAddTask('일상업무')}
            onUpdate={(index, value) => handleLocalUpdate('일상업무', index, value)}
            onSave={(index) => handleSaveTask('일상업무', index)}
            onDelete={(index) => handleDeleteTask('일상업무', index)}
            onMoveUp={(index) => handleMoveUp('일상업무', index)}
            onMoveDown={(index) => handleMoveDown('일상업무', index)}
            placeholder="일상업무를 입력하세요"
          />
          <MonthlyTaskCell
            title="월별 정기업무"
            activeMonth={activeMonth}
            monthlyTasks={monthlyTasks}
            onAdd={(month) => handleAddTask('정기업무', month)}
            onUpdate={(month, index, value) => handleLocalUpdate('정기업무', index, value, month)}
            onSave={(month, index) => handleSaveTask('정기업무', index, month)}
            onDelete={(month, index) => handleDeleteTask('정기업무', index, month)}
            onMoveUp={(month, index) => handleMoveUp('정기업무', index, month)}
            onMoveDown={(month, index) => handleMoveDown('정기업무', index, month)}
            onChangeMonth={setActiveMonth}
          />
        </div>
      </div>
    </div>
  );
}