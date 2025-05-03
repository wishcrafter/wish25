'use client';

export default function WCustomerContentSkeleton() {
  return (
    <div className="p-4">
      {/* 필터 스켈레톤 */}
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="h-9 w-16 bg-gray-200 animate-pulse rounded-md"
          ></div>
        ))}
      </div>
      
      {/* 테이블 스켈레톤 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="border p-2">
                  <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    <div className="h-5 bg-gray-200 animate-pulse rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 