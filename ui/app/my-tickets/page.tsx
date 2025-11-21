// app/my-tickets/page.tsx

"use client";

import React from 'react';

// 'MyTicketsPage'라는 이름의 함수형 컴포넌트를 기본값으로 내보냅니다.
export default function MyTicketsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">내 티켓 목록 (구현 예정)</h1>
      <p className="text-slate-600">이곳에 현재 로그인한 사용자 본인이 생성한 티켓만 표시됩니다.</p>
      {/* 여기에 티켓 목록 테이블 컴포넌트를 나중에 추가할 예정입니다. */}
    </div>
  );
}
