"use client";

export default function EngineerContent() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">
        엔지니어 대시보드
      </h2>

      <p className="text-slate-600">
        기술 장애 티켓, 우선순위 작업, SLA 대응 현황 등을 확인할 수 있습니다.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">오늘 처리해야 할 작업</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">5건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">대기 중 장애 티켓</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">3건</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow">
          <p className="text-sm text-slate-600">SLA 위험 티켓</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">2건</h3>
        </div>
      </div>
    </div>
  );
}
