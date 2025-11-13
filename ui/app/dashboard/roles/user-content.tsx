"use client";

export default function UserContent() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">내 티켓 대시보드</h2>

      <p className="text-slate-600">
        내가 요청한 티켓의 상태와 처리 현황을 확인할 수 있습니다.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">열린 티켓</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">2건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">진행 중</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">1건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">해결 완료</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">5건</h3>
        </div>
      </div>
    </div>
  );
}
