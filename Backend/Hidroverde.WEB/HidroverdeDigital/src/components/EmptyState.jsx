export default function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-2 animate-fade-in">
      <div className="text-5xl mb-1 opacity-60">{icon}</div>
      <div className="font-bold text-gray-700 text-base">{title}</div>
      {subtitle && <div className="text-sm text-gray-400 max-w-xs">{subtitle}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
