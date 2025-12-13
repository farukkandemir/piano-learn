import { useNavigate } from "react-router-dom";

export default function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate("/")}
          className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold text-zinc-100">Keyvana</h1>
        <div className="w-16" />
      </header>

      {/* Sheet Music Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="h-full rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 flex items-center justify-center">
          <p className="text-zinc-500">
            Sheet music will render here (Phase 3)
          </p>
        </div>
      </div>

      {/* Piano Area */}
      <div className="h-48 bg-zinc-900 border-t border-white/5 flex items-center justify-center">
        <p className="text-zinc-500">88-key piano will render here (Phase 4)</p>
      </div>
    </div>
  );
}
