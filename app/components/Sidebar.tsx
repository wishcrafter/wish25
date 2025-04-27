'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const router = useRouter();
  const menuItems = [
    // 관리 메뉴
    { 
      group: '관리',
      items: [
        { href: '/management/sales', label: '매출 관리' },
        { href: '/management/purchases', label: '매입 관리' },
        { href: '/management/expenses', label: '비용 관리' },
        { href: '/management/others', label: '기타 거래 관리' },
        { href: '/management/wstudio', label: '스튜디오 매출 관리' },
        { href: '/management/w_customer', label: '스튜디오 고객 관리' },
      ]
    },
    // 정보 메뉴
    {
      group: '정보',
      items: [
        { href: '/master/stores', label: '점포 정보' },
        { href: '/master/vendors', label: '거래처 정보' },
        { href: '/master/w_rooms', label: '스튜디오 방 정보' },
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

  const handleLogout = () => {
    Cookies.remove('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <a href="/" className="nav-link">홈</a>
          </li>
          <li>
            <a href="/dashboard" className="nav-link">대시보드</a>
          </li>
          {menuItems.map((group, groupIndex) => (
            <li key={groupIndex}>
              <div className="nav-group">
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
          <li className="mt-auto">
            <button 
              onClick={handleLogout} 
              className="logout-btn w-full text-left"
            >
              로그아웃
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 