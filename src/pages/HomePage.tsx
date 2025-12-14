import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      sessionStorage.setItem("musicxml-content", content);
      sessionStorage.setItem("musicxml-filename", file.name);
      navigate("/play");
    } catch {
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
    <div className="dark min-h-screen flex flex-col bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,.musicxml,.mxl"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main content */}
      <main className="">
        {/* Upload Card */}
        <Card
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="">
            <h2 className="">Upload MusicXML</h2>

            <p className="">Drag and drop or click to browse</p>

            <Button variant="outline" size="sm" className="pointer-events-none">
              Select File
            </Button>

            <p className="text-xs text-muted-foreground/70 mt-4">
              .xml, .musicxml, .mxl
            </p>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && <p>{error}</p>}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground/50">
          Made for piano learners
        </p>
      </footer>
    </div>
  );
}
