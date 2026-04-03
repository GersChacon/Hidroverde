const THEMES = {
  green:  { bg: "from-green-50 to-emerald-50/50", border: "border-green-100", val: "text-green-900", icon: "bg-green-100 text-green-600" },
  blue:   { bg: "from-blue-50 to-sky-50/50",      border: "border-blue-100",  val: "text-blue-900",  icon: "bg-blue-100 text-blue-600"  },
  orange: { bg: "from-orange-50 to-amber-50/50",  border: "border-orange-100",val: "text-orange-900",icon: "bg-orange-100 text-orange-600"},
  red:    { bg: "from-red-50 to-rose-50/50",      border: "border-red-100",   val: "text-red-900",   icon: "bg-red-100 text-red-600"   },
};

export default function KpiCard({ icon, label, value, hint, color = "green" }) {
  const t = THEMES[color] ?? THEMES.green;
  return (
    <div className={`bg-gradient-to-br ${t.bg} border ${t.border} rounded-2xl p-4 flex flex-col gap-2 animate-fade-in-up`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${t.icon}`}>
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-black ${t.val} tracking-tight leading-none`}>{value ?? "—"}</div>
      {hint && <div className="text-[11px] text-gray-400 leading-tight">{hint}</div>}
    </div>
  );
}
