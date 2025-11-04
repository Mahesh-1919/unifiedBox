"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2 - 75,
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e);
  };

  return (
    <div className="relative">
      <div className="border rounded-md">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          className={`p-3 min-h-[60px] max-h-[200px] overflow-y-auto outline-none ${className}`}
          data-placeholder={placeholder}
          style={{
            wordWrap: "break-word",
          }}
          suppressContentEditableWarning
        />
      </div>
      
      {showToolbar && (
        <div
          className="fixed z-50 flex gap-1 p-2 bg-background border rounded-md shadow-lg"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
          }}
        >
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => execCommand("bold")}
            className="h-8 w-8 p-0"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => execCommand("italic")}
            className="h-8 w-8 p-0"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => execCommand("underline")}
            className="h-8 w-8 p-0"
          >
            <Underline className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}