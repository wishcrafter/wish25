// app/dashboard/components/MonthRangeSlider.tsx
'use client';
import React from 'react';
import type { SliderProps } from 'rc-slider';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface Props {
  /** [최소월, 최대월] */
  values: [number, number];
  /** 변경된 [최소월, 최대월]을 받습니다 */
  onChange: (vals: [number, number]) => void;
}

// 1~12월 눈금(mark) 생성 - 스타일과 레이블을 포함한 객체로 정의
const marks: Record<number, { style: React.CSSProperties; label: string }> = {};
for (let i = 1; i <= 12; i++) {
  marks[i] = {
    style: {
      marginTop: '10px',
      fontSize: '0.7rem',
      color: '#64748b',
      whiteSpace: 'nowrap',
      minWidth: 20,
      display: 'inline-block',
      transform: 'translateX(-50%)',
      textAlign: 'center',
    },
    label: `${i}월`
  };
}

export default function MonthRangeSlider({ values, onChange }: Props) {
  // rc-slider의 타입을 맞추기 위한 핸들러
  const handleChange: SliderProps['onChange'] = (value) => {
    if (Array.isArray(value) && value.length === 2) {
      onChange([value[0], value[1]]);
    }
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Slider
        range
        min={1}
        max={12}
        step={1}
        allowCross={false}
        marks={marks}
        value={values}
        onChange={handleChange}
        railStyle={{ height: 6, backgroundColor: '#e0e0e0' }}
        trackStyle={[{ backgroundColor: '#3b82f6', height: 6 }]}
        handleStyle={[
          { height: 16, width: 16, marginTop: -5, backgroundColor: '#3b82f6', border: 'none' },
          { height: 16, width: 16, marginTop: -5, backgroundColor: '#3b82f6', border: 'none' }
        ]}
      />
    </div>
  );
}
