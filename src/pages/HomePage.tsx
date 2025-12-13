import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-white">Keyvana</h1>
        <p className="text-zinc-400 text-lg">
          Learn piano with sheet music visualization
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className="w-full max-w-2xl p-16 flex flex-col items-center justify-center cursor-pointer
                   border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900/50
                   hover:border-zinc-500 hover:bg-zinc-900
                   transition-all duration-200"
        onClick={() => navigate("/play")}
      >
        <div className="w-16 h-16 mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-zinc-100">
          Upload MusicXML File
        </h2>
        <p className="text-zinc-500 text-center">
          Drag and drop your .xml, .musicxml, or .mxl file here
          <br />
          <span className="text-sm">or click to browse</span>
        </p>
      </div>

      <p className="mt-8 text-zinc-600 text-sm">
        Supported formats: MusicXML (.xml, .musicxml, .mxl)
      </p>
    </div>
  );
}
