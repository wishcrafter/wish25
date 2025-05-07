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
  selectedIndex,
  onSelect,
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
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onSave: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  placeholder: string;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  const handleRowClick = (index: number) => {
    console.log('항목 선택:', index);
    onSelect(index === selectedIndex ? null : index); // 같은 항목 클릭 시 선택 해제
  };
  
  const handleMoveUp = () => {
    console.log('TaskCell handleMoveUp 호출, selectedIndex:', selectedIndex);
    if (selectedIndex !== null && selectedIndex > 0) {
      console.log('onMoveUp 함수 호출 직전, 인덱스:', selectedIndex);
      onMoveUp(selectedIndex);
    } else {
      console.log('이동 불가: selectedIndex가 null이거나 0임');
    }
  };
  
  const handleMoveDown = () => {
    if (selectedIndex !== null && selectedIndex < tasks.length - 1) {
      onMoveDown(selectedIndex);
    }
  };
  
  return (
    <div className="summary-card">
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-base mr-2">{title}</span>
          <div className="flex space-x-1">
            <button 
              className="btn btn-outline btn-xs"
              onClick={handleMoveUp}
              disabled={selectedIndex === null || selectedIndex === 0}
              title="선택 항목 위로 이동"
            >▲</button>
            <button 
              className="btn btn-outline btn-xs"
              onClick={handleMoveDown}
              disabled={selectedIndex === null || selectedIndex === tasks.length - 1}
              title="선택 항목 아래로 이동"
            >▼</button>
            <button 
              className="btn btn-primary btn-xs"
              onClick={onAdd}
              title="새 항목 추가"
            >
              + 추가
            </button>
          </div>
        </div>
      </div>
      <div>
        {tasks.map((task, index) => (
          <div 
            key={`task-${index}`} 
            className={`task-row-flex cursor-pointer ${selectedIndex === index ? 'bg-blue-100 border-blue-500 border-2' : ''}`}
            onClick={() => handleRowClick(index)}
          >
            <input
              type="text"
              value={task.content || ''}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={focusedIndex !== index && (!task.content || task.content === 'null') ? placeholder : ''}
              className={`form-input flex-1 ${task.isDirty ? 'border-yellow-500' : ''}`}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                // 입력창 클릭해도 해당 항목 선택
                handleRowClick(index);
              }}
            />
            <div className="task-controls-horizontal" onClick={(e) => e.stopPropagation()}>
              <button 
                className={`btn ${task.isDirty ? 'btn-warning' : 'btn-success'} btn-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(index);
                }}
                title="저장"
                disabled={!task.isDirty}
              >저장</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
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
  selectedIndex,
  onSelect,
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
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  onAdd: (month: number) => void;
  onUpdate: (month: number, index: number, value: string) => void;
  onSave: (month: number, index: number) => void;
  onDelete: (month: number, index: number) => void;
  onMoveUp: (month: number, index: number) => void;
  onMoveDown: (month: number, index: number) => void;
  onChangeMonth: (month: number) => void;
}) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const activeTasks = monthlyTasks[activeMonth] || [];
  
  const handleRowClick = (index: number) => {
    console.log('항목 선택:', index);
    onSelect(index === selectedIndex ? null : index); // 같은 항목 클릭 시 선택 해제
  };
  
  const handleMoveUp = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      onMoveUp(activeMonth, selectedIndex);
    }
  };
  
  const handleMoveDown = () => {
    if (selectedIndex !== null && selectedIndex < activeTasks.length - 1) {
      onMoveDown(activeMonth, selectedIndex);
    }
  };
  
  // 월이 변경되면 선택된 항목 초기화
  useEffect(() => {
    onSelect(null);
  }, [activeMonth, onSelect]);
  
  return (
    <div className="summary-card">
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-base mr-2">{title}</span>
          <div className="flex space-x-1">
            <button 
              className="btn btn-outline btn-xs"
              onClick={handleMoveUp}
              disabled={selectedIndex === null || selectedIndex === 0}
              title="선택 항목 위로 이동"
            >▲</button>
            <button 
              className="btn btn-outline btn-xs"
              onClick={handleMoveDown}
              disabled={selectedIndex === null || selectedIndex === activeTasks.length - 1}
              title="선택 항목 아래로 이동"
            >▼</button>
            <button 
              className="btn btn-primary btn-xs"
              onClick={() => onAdd(activeMonth)}
              title="새 항목 추가"
            >
              + 추가
            </button>
          </div>
        </div>
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
        {activeTasks.map((task, index) => (
          <div 
            key={`monthly-${activeMonth}-${index}`} 
            className={`task-row-flex cursor-pointer ${selectedIndex === index ? 'bg-blue-100 border-blue-500 border-2' : ''}`}
            onClick={() => handleRowClick(index)}
          >
            <input
              type="text"
              value={task.content || ''}
              onChange={(e) => onUpdate(activeMonth, index, e.target.value)}
              placeholder={focusedIndex !== index && (!task.content || task.content === 'null') ? `${activeMonth}월 정기업무를 입력하세요` : ''}
              className={`form-input flex-1 ${task.isDirty ? 'border-yellow-500' : ''}`}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                // 입력창 클릭해도 해당 항목 선택
                handleRowClick(index);
              }}
            />
            <div className="task-controls-horizontal" onClick={(e) => e.stopPropagation()}>
              <button 
                className={`btn ${task.isDirty ? 'btn-warning' : 'btn-success'} btn-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(activeMonth, index);
                }}
                title="저장"
                disabled={!task.isDirty}
              >저장</button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(activeMonth, index);
                }}
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
  
  // 선택된 항목의 인덱스를 저장하는 상태 변수 추가
  const [selectedUrgentIndex, setSelectedUrgentIndex] = useState<number | null>(null);
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number | null>(null);
  const [selectedMonthlyIndex, setSelectedMonthlyIndex] = useState<number | null>(null);
  
  // 선택된 항목의 정보를 저장하는 상태 변수
  const [selectedUrgentId, setSelectedUrgentId] = useState<number | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  const [selectedMonthlyId, setSelectedMonthlyId] = useState<number | null>(null);
  
  // 선택된 항목의 인덱스가 변경될 때 ID도 함께 업데이트
  useEffect(() => {
    if (selectedUrgentIndex !== null && urgentTasks[selectedUrgentIndex]?.id) {
      setSelectedUrgentId(urgentTasks[selectedUrgentIndex].id || null);
    } else {
      setSelectedUrgentId(null);
    }
  }, [selectedUrgentIndex, urgentTasks]);

  useEffect(() => {
    if (selectedRoutineIndex !== null && routineTasks[selectedRoutineIndex]?.id) {
      setSelectedRoutineId(routineTasks[selectedRoutineIndex].id || null);
    } else {
      setSelectedRoutineId(null);
    }
  }, [selectedRoutineIndex, routineTasks]);

  useEffect(() => {
    if (selectedMonthlyIndex !== null && 
        monthlyTasks[activeMonth] && 
        monthlyTasks[activeMonth][selectedMonthlyIndex]?.id) {
      setSelectedMonthlyId(monthlyTasks[activeMonth][selectedMonthlyIndex].id || null);
    } else {
      setSelectedMonthlyId(null);
    }
  }, [selectedMonthlyIndex, monthlyTasks, activeMonth]);
  
  // 데이터 로드 및 정렬 함수
  const loadTodos = async () => {
    try {
      // 선택된 ID 저장 (기존 선택 항목을 다시 찾기 위함)
      const savedUrgentId = selectedUrgentId;
      const savedRoutineId = selectedRoutineId;
      const savedMonthlyId = selectedMonthlyId;
      
      // ID 정렬을 위한 데이터 로드 및 업데이트 (소수점 ID 정규화)
      // 임시로 주석 처리 - ID 정규화 작업 제외
      // await normalizeIds();
      
      const { data, error } = await supabase
        .from('todo_list')
        .select('id, group, todo, month')
        .order('id');
      
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
        
        // 선택 초기화
        setSelectedUrgentIndex(null);
        setSelectedRoutineIndex(null);
        setSelectedMonthlyIndex(null);
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
      
      // ID를 기준으로 선택된 항목의 새 인덱스 찾기
      if (savedUrgentId !== null) {
        const newIndex = urgent.findIndex(item => item.id === savedUrgentId);
        if (newIndex !== -1) {
          setSelectedUrgentIndex(newIndex);
          console.log('당면업무 선택 항목 복원:', { savedId: savedUrgentId, newIndex });
        } else {
          setSelectedUrgentIndex(null);
        }
      }
      
      if (savedRoutineId !== null) {
        const newIndex = routine.findIndex(item => item.id === savedRoutineId);
        if (newIndex !== -1) {
          setSelectedRoutineIndex(newIndex);
          console.log('일상업무 선택 항목 복원:', { savedId: savedRoutineId, newIndex });
        } else {
          setSelectedRoutineIndex(null);
        }
      }
      
      if (savedMonthlyId !== null && monthly[activeMonth]) {
        const newIndex = monthly[activeMonth].findIndex(item => item.id === savedMonthlyId);
        if (newIndex !== -1) {
          setSelectedMonthlyIndex(newIndex);
          console.log('정기업무 선택 항목 복원:', { savedId: savedMonthlyId, newIndex });
        } else {
          setSelectedMonthlyIndex(null);
        }
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };
  
  // ID 정규화 함수 - 소수점 ID를 정수로 변환
  const normalizeIds = async () => {
    try {
      // 각 그룹별로 데이터 로드
      const groups = ['당면업무', '일상업무', '정기업무'];
      
      for (const group of groups) {
        // 월별 정기업무 처리
        if (group === '정기업무') {
          for (let month = 1; month <= 12; month++) {
            await normalizeGroupIds(group, month);
          }
        } else {
          await normalizeGroupIds(group);
        }
      }
      
      console.log('ID 정규화 완료');
    } catch (error) {
      console.error('ID 정규화 오류:', error);
    }
  };
  
  // 그룹별 ID 정규화
  const normalizeGroupIds = async (group: string, month?: number) => {
    try {
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('*')  // 모든 필드 선택
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data, error } = await query;
      
      if (error || !data) {
        console.error('그룹 데이터 조회 오류:', error);
        return;
      }
      
      // ID가 소수점인 항목이 있는지 확인
      const hasDecimalIds = data.some(item => Math.floor(item.id) !== item.id);
      
      if (hasDecimalIds || data.length > 0) {
        console.log(`${group}${month ? ' ' + month + '월' : ''} ID 정규화 시작, 항목 수:`, data.length);
        
        // ID 순서대로 정렬
        const sortedItems = [...data].sort((a, b) => a.id - b.id);
        
        // 새 항목 생성 (ID 재할당은 Supabase가 자동으로 수행)
        for (let i = 0; i < sortedItems.length; i++) {
          const item = sortedItems[i];
          
          try {
            // 항목 복제를 위한 새 객체 생성 (ID 제외)
            const newItem = { 
              group: item.group,
              todo: item.todo,
              month: item.month
            };
            
            // 새 항목 추가
            const { data: insertData, error: insertError } = await supabase
              .from('todo_list')
              .insert([newItem])
              .select();
              
            if (insertError) {
              console.error('항목 복제 오류:', insertError);
              continue;
            }
            
            // 기존 항목 삭제
            const { error: deleteError } = await supabase
              .from('todo_list')
              .delete()
              .eq('id', item.id);
              
            if (deleteError) {
              console.error('기존 항목 삭제 오류:', deleteError);
            }
            
          } catch (itemError) {
            console.error('항목 처리 오류:', itemError);
          }
        }
        
        console.log(`${group}${month ? ' ' + month + '월' : ''} ID 정규화 완료`);
      } else {
        console.log(`${group}${month ? ' ' + month + '월' : ''} ID 정규화 필요 없음`);
      }
    } catch (error) {
      console.error('그룹 ID 정규화 오류:', error);
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
    console.log('Home 컴포넌트 handleMoveUp 호출됨:', { group, index, month });
    
    if (index === 0) {
      console.log('첫 번째 항목이라 이동 불가');
      return;
    }
    
    try {
      console.log('위로 이동 시작:', { group, index, month });
      
      // 현재 선택된 항목의 ID 저장
      let selectedItemId: number | null = null;
      let todo: string = '';
      
      if (group === '당면업무' && urgentTasks[index]) {
        selectedItemId = urgentTasks[index].id || null;
        todo = urgentTasks[index].content;
      } else if (group === '일상업무' && routineTasks[index]) {
        selectedItemId = routineTasks[index].id || null;
        todo = routineTasks[index].content;
      } else if (group === '정기업무' && month && monthlyTasks[month] && monthlyTasks[month][index]) {
        selectedItemId = monthlyTasks[month][index].id || null;
        todo = monthlyTasks[month][index].content;
      }
      
      if (!selectedItemId) {
        console.error('선택된 항목 ID를 찾을 수 없음');
        return;
      }
      
      console.log('선택된 항목 ID:', selectedItemId);
      
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('*')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: items, error: fetchError } = await query;

      if (fetchError || !items || items.length < 2) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      // 현재 인덱스와 이전 인덱스 항목 찾기
      const currentItem = items[index];
      const prevItem = items[index - 1];
      
      if (!currentItem || !prevItem) {
        console.error('이동할 항목을 찾을 수 없음');
        return;
      }
      
      console.log('이동할 항목:', { 
        current: currentItem,
        prev: prevItem
      });
      
      // 인덱스를 하나 감소 (위로 이동)
      const newIndex = index - 1;
      
      // 선택된 항목의 ID를 유지하고 인덱스 업데이트
      if (group === '당면업무') {
        setSelectedUrgentId(selectedItemId);
        setSelectedUrgentIndex(newIndex);
      } else if (group === '일상업무') {
        setSelectedRoutineId(selectedItemId);
        setSelectedRoutineIndex(newIndex);
      } else if (group === '정기업무') {
        setSelectedMonthlyId(selectedItemId);
        setSelectedMonthlyIndex(newIndex);
      }
      
      // 내용 교환 방식으로 위치 변경 (ID 필드를 직접 수정하지 않음)
      const { error: updateError } = await supabase
        .from('todo_list')
        .upsert([
          { id: currentItem.id, todo: prevItem.todo },
          { id: prevItem.id, todo: currentItem.todo }
        ]);
      
      if (updateError) {
        console.error('위치 변경 오류:', updateError);
        return;
      }
      
      // 로컬 배열 직접 업데이트하여 페이지 새로고침 없이 즉시 반영
      if (group === '당면업무') {
        const updatedTasks = [...urgentTasks];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        setUrgentTasks(updatedTasks);
      } else if (group === '일상업무') {
        const updatedTasks = [...routineTasks];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        setRoutineTasks(updatedTasks);
      } else if (group === '정기업무' && month) {
        const updatedMonthlyTasks = {...monthlyTasks};
        const updatedTasks = [...updatedMonthlyTasks[month]];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        updatedMonthlyTasks[month] = updatedTasks;
        setMonthlyTasks(updatedMonthlyTasks);
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
    }
  };

  // 업무 순서 변경 핸들러 (아래로)
  const handleMoveDown = async (group: string, index: number, month?: number) => {
    try {
      console.log('아래로 이동 시작:', { group, index, month });
      
      // 현재 선택된 항목의 ID 저장
      let selectedItemId: number | null = null;
      let todo: string = '';
      
      if (group === '당면업무' && urgentTasks[index]) {
        selectedItemId = urgentTasks[index].id || null;
        todo = urgentTasks[index].content;
      } else if (group === '일상업무' && routineTasks[index]) {
        selectedItemId = routineTasks[index].id || null;
        todo = routineTasks[index].content;
      } else if (group === '정기업무' && month && monthlyTasks[month] && monthlyTasks[month][index]) {
        selectedItemId = monthlyTasks[month][index].id || null;
        todo = monthlyTasks[month][index].content;
      }
      
      if (!selectedItemId) {
        console.error('선택된 항목 ID를 찾을 수 없음');
        return;
      }
      
      console.log('선택된 항목 ID:', selectedItemId);
      
      // Supabase 쿼리 빌더 초기화
      let query = supabase
        .from('todo_list')
        .select('*')
        .eq('group', group)
        .order('id');
      
      // 정기업무인 경우 month 필터 추가
      if (group === '정기업무' && month) {
        query = query.eq('month', month);
      } else if (group !== '정기업무') {
        // 정기업무가 아닌 경우 month가 null인 항목만 필터링
        query = query.is('month', null);
      }
      
      const { data: items, error: fetchError } = await query;

      if (fetchError || !items || index >= items.length - 1) {
        console.error('데이터 조회 오류:', fetchError);
        return;
      }

      // 현재 인덱스와 다음 인덱스 항목 찾기
      const currentItem = items[index];
      const nextItem = items[index + 1];
      
      if (!currentItem || !nextItem) {
        console.error('이동할 항목을 찾을 수 없음');
        return;
      }
      
      console.log('이동할 항목:', { 
        current: currentItem,
        next: nextItem
      });
      
      // 인덱스를 하나 증가 (아래로 이동)
      const newIndex = index + 1;
      
      // 선택된 항목의 ID를 유지하고 인덱스 업데이트
      if (group === '당면업무') {
        setSelectedUrgentId(selectedItemId);
        setSelectedUrgentIndex(newIndex);
      } else if (group === '일상업무') {
        setSelectedRoutineId(selectedItemId);
        setSelectedRoutineIndex(newIndex);
      } else if (group === '정기업무') {
        setSelectedMonthlyId(selectedItemId);
        setSelectedMonthlyIndex(newIndex);
      }
      
      // 내용 교환 방식으로 위치 변경 (ID 필드를 직접 수정하지 않음)
      const { error: updateError } = await supabase
        .from('todo_list')
        .upsert([
          { id: currentItem.id, todo: nextItem.todo },
          { id: nextItem.id, todo: currentItem.todo }
        ]);
      
      if (updateError) {
        console.error('위치 변경 오류:', updateError);
        return;
      }
      
      // 로컬 배열 직접 업데이트하여 페이지 새로고침 없이 즉시 반영
      if (group === '당면업무') {
        const updatedTasks = [...urgentTasks];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        setUrgentTasks(updatedTasks);
      } else if (group === '일상업무') {
        const updatedTasks = [...routineTasks];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        setRoutineTasks(updatedTasks);
      } else if (group === '정기업무' && month) {
        const updatedMonthlyTasks = {...monthlyTasks};
        const updatedTasks = [...updatedMonthlyTasks[month]];
        // 항목 위치 교환
        [updatedTasks[index], updatedTasks[newIndex]] = [updatedTasks[newIndex], updatedTasks[index]];
        updatedMonthlyTasks[month] = updatedTasks;
        setMonthlyTasks(updatedMonthlyTasks);
      }
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

  // 디버깅용 콘솔 출력
  useEffect(() => {
    console.log('현재 상태:', { 
      urgentTasks, 
      routineTasks, 
      monthlyTasks,
      activeMonth,
      selectedUrgentIndex,
      selectedRoutineIndex,
      selectedMonthlyIndex
    });
  }, [urgentTasks, routineTasks, monthlyTasks, activeMonth, 
      selectedUrgentIndex, selectedRoutineIndex, selectedMonthlyIndex]);

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
            selectedIndex={selectedUrgentIndex}
            onSelect={setSelectedUrgentIndex}
            onAdd={() => handleAddTask('당면업무')}
            onUpdate={(index, value) => handleLocalUpdate('당면업무', index, value)}
            onSave={(index) => handleSaveTask('당면업무', index)}
            onDelete={(index) => handleDeleteTask('당면업무', index)}
            onMoveUp={(index) => {
              console.log('당면업무 onMoveUp 호출됨, 인덱스:', index);
              handleMoveUp('당면업무', index);
            }}
            onMoveDown={(index) => {
              console.log('당면업무 onMoveDown 호출됨, 인덱스:', index);
              handleMoveDown('당면업무', index);
            }}
            placeholder="당면업무를 입력하세요"
          />
          <TaskCell
            title="일상업무"
            tasks={routineTasks}
            selectedIndex={selectedRoutineIndex}
            onSelect={setSelectedRoutineIndex}
            onAdd={() => handleAddTask('일상업무')}
            onUpdate={(index, value) => handleLocalUpdate('일상업무', index, value)}
            onSave={(index) => handleSaveTask('일상업무', index)}
            onDelete={(index) => handleDeleteTask('일상업무', index)}
            onMoveUp={(index) => {
              console.log('일상업무 onMoveUp 호출됨, 인덱스:', index);
              handleMoveUp('일상업무', index);
            }}
            onMoveDown={(index) => {
              console.log('일상업무 onMoveDown 호출됨, 인덱스:', index);
              handleMoveDown('일상업무', index);
            }}
            placeholder="일상업무를 입력하세요"
          />
          <MonthlyTaskCell
            title="월별 정기업무"
            activeMonth={activeMonth}
            monthlyTasks={monthlyTasks}
            selectedIndex={selectedMonthlyIndex}
            onSelect={setSelectedMonthlyIndex}
            onAdd={(month) => handleAddTask('정기업무', month)}
            onUpdate={(month, index, value) => handleLocalUpdate('정기업무', index, value, month)}
            onSave={(month, index) => handleSaveTask('정기업무', index, month)}
            onDelete={(month, index) => handleDeleteTask('정기업무', index, month)}
            onMoveUp={(month, index) => {
              console.log('정기업무 onMoveUp 호출됨, 월:', month, '인덱스:', index);
              handleMoveUp('정기업무', index, month);
            }}
            onMoveDown={(month, index) => {
              console.log('정기업무 onMoveDown 호출됨, 월:', month, '인덱스:', index);
              handleMoveDown('정기업무', index, month);
            }}
            onChangeMonth={(month) => {
              setActiveMonth(month);
              setSelectedMonthlyIndex(null); // 월 변경 시 선택 항목 초기화
            }}
          />
        </div>
      </div>
    </div>
  );
}