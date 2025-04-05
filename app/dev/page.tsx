'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function TestPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('*');

      if (error) {
        console.error('Error:', error);
        setData(error);
      } else {
        console.log('Data:', data);
        setData(data);
      }
    }

    fetchStores();
  }, []);

  return (
    <div className="main">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 