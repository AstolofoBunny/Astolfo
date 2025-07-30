import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  description?: string;
}

export default function FileUpload({ 
  accept, 
  multiple = false, 
  onFilesSelected, 
  description = "Click to browse or drag and drop files here" 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelected(files);
  };

  const handleFilesSelected = (files: File[]) => {
    const newFiles = multiple ? [...selectedFiles, ...files] : files;
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-blue-50"
            : "border-slate-300 hover:border-primary hover:bg-slate-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 mb-2">{description}</p>
        <Button type="button" variant="outline">
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-900">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-medium text-sm text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
