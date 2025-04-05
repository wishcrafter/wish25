'use client';

export default function Sidebar() {
  const menuItems = [
    // 관리 메뉴
    { 
      group: '관리',
      items: [
        { href: '/management/sales', label: '매출관리' },
        { href: '/management/purchases', label: '매입관리' },
        { href: '/management/expenses', label: '비용관리' },
        { href: '/management/others', label: '기타관리' },
      ]
    },
    // 정보 메뉴
    {
      group: '정보',
      items: [
        { href: '/master/stores', label: '점포정보' },
        { href: '/master/vendors', label: '거래처정보' },
      ]
    },
    // 개발 메뉴
    {
      group: '개발',
      items: [
        { href: '/dev/test', label: '테스트' },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <a href="/" className="nav-link">홈</a>
          </li>
          {menuItems.map((group, groupIndex) => (
            <li key={groupIndex}>
              <div style={{ 
                color: '#666',
                fontSize: '0.8em',
                padding: '10px 10px 5px 10px',
                marginTop: groupIndex > 0 ? '15px' : '0'
              }}>
                {group.group}
              </div>
              <ul style={{ paddingLeft: '10px' }}>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="nav-link">{item.label}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 