export default function TerminalCard({ title, children }: any) {
  return (
    <div className="bg-black border border-green-500 p-4 rounded-lg shadow-lg">
      <h2 className="text-green-400 font-mono mb-2">{title}</h2>

      <div className="text-green-200 text-sm font-mono">{children}</div>
    </div>
  );
}
