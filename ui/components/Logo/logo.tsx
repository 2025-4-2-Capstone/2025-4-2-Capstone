export default function BrandLogo() {
  return (
    <div className="flex items-center gap-8">
      {/* LEFT SYMBOL */}
      <svg width="90" height="140" viewBox="0 0 200 240">
        <path 
          d="M90 20 L160 200 L40 200 Z"
          fill="black"
        />
      </svg>

      {/* RIGHT TEXT */}
      <div className="flex flex-col leading-tight">
        <span className="text-[42px] tracking-[8px] font-light">
          OPERATION
        </span>
        <span className="text-[42px] tracking-[14px] font-light">
          LOG
        </span>
      </div>
    </div>
  );
}
