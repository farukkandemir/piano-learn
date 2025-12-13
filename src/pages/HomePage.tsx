import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";

const VALID_EXTENSIONS = [".xml", ".musicxml", ".mxl"];

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!VALID_EXTENSIONS.includes(extension)) {
      setError(
        `Invalid file type. Please upload ${VALID_EXTENSIONS.join(", ")} files.`
      );
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const content = await file.text();
      // Store in sessionStorage for PlayPage to access
      sessionStorage.setItem("musicxml-content", content);
      sessionStorage.setItem("musicxml-filename", file.name);
      navigate("/play");
    } catch (err) {
      setError("Failed to read file. Please try again.");
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,.musicxml,.mxl"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-white">Keyvana</h1>
        <p className="text-zinc-400 text-lg">
          Learn piano with sheet music visualization
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`w-full max-w-2xl p-16 flex flex-col items-center justify-center cursor-pointer
                   border-2 border-dashed rounded-2xl transition-all duration-200
                   ${
                     isDragging
                       ? "border-white bg-zinc-800"
                       : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
                   }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={`w-16 h-16 mb-6 rounded-full flex items-center justify-center transition-colors
                        ${isDragging ? "bg-zinc-700" : "bg-zinc-800"}`}
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              isDragging ? "text-white" : "text-zinc-400"
            }`}
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
          {isDragging ? (
            "Drop your file here"
          ) : (
            <>
              Drag and drop your file here
              <br />
              <span className="text-sm">or click to browse</span>
            </>
          )}
        </p>
      </div>

      {/* Error message */}
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

      <p className="mt-8 text-zinc-600 text-sm">
        Supported formats: MusicXML (.xml, .musicxml, .mxl)
      </p>
    </div>
  );
}
