"use client";

export default function SupportContent() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">
        고객지원 대시보드
      </h2>

      <p className="text-slate-600">
        신규 문의, 접수된 요청, 처리 현황 등을 확인할 수 있습니다.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">오늘 신규 접수</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">12건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">미처리 문의</p>
          <h3 className="text-2xl font-bold text-orange-600 mt-1">7건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">오늘 처리한 요청</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">15건</h3>
        </div>
      </div>
    </div>
  );
}
