"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED = ["application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const MAX_MB = 5;

export default function FileUpload({ file, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(f: File): string | null {
    const isAccepted =
      ACCEPTED.includes(f.type) || f.name.endsWith(".pdf") || f.name.endsWith(".docx");
    if (!isAccepted) return "Only PDF and DOCX files are supported.";
    if (f.size > MAX_MB * 1024 * 1024) return `File must be under ${MAX_MB}MB.`;
    return null;
  }

  function handleFile(f: File) {
    const err = validate(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onChange(f);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function formatBytes(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-2">
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-500 bg-brand-50 px-4 py-3">
          <FileText size={20} className="shrink-0 text-brand-600" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
          </div>
          {!disabled && (
            <button
              onClick={() => onChange(null)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all",
            dragging
              ? "border-brand-500 bg-brand-50"
              : "border-gray-200 bg-gray-50 hover:border-brand-500 hover:bg-brand-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <UploadCloud size={28} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Drop your resume here or{" "}
            <span className="text-brand-600 underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">PDF or DOCX · Max 5MB</p>
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={onInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
