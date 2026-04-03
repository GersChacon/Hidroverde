export default function Spinner({ text = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400 animate-fade-in">
      <div className="w-8 h-8 border-[3px] border-green-200 border-t-green-500 rounded-full animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
