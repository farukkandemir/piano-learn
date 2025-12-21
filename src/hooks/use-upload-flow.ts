import { useState, useRef, type ChangeEvent } from "react";
import { toast } from "sonner";

const VALID_EXTENSIONS = [".xml", ".musicxml"];

export function useUploadFlow() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTitle = selectedFile
    ? selectedFile.name.replace(/\.(xml|musicxml)$/i, "")
    : "";

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return VALID_EXTENSIONS.includes(extension);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      toast.error(
        `Invalid file type. Please upload ${VALID_EXTENSIONS.join(", ")} files.`
      );
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setIsModalOpen(true);
    e.target.value = ""; // Reset input for re-selection
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return {
    // File handling
    fileInputRef,
    selectedFile,
    handleUploadClick,
    handleInputChange,
    initialTitle,

    // Modal state
    isModalOpen,
    closeModal,
  };
}
