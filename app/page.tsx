'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface Statistics {
  storeCount: number;
  vendorCount: number;
  totalSales: number;
  totalPurchases: number;
}

export default function HomePage() {
  return (
    <div className="page-container">
      <h1 className="page-title">대시보드</h1>
    </div>
  );
}