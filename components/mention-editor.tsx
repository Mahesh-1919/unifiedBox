"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profileImageUrl?: string;
}

interface MentionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MentionEditor({
  value,
  onChange,
  placeholder,
  className,
}: MentionEditorProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: showMentions,
  });

  const filteredUsers =
    users?.filter((user) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const searchText = (name || user.email).toLowerCase();
      return searchText.includes(mentionQuery.toLowerCase());
    }) || [];

  const getDisplayName = (user: User) => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.email;
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowMentions(false);
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    const beforeAt = value.substring(0, atIndex);
    const mention = `@${getDisplayName(user)} `;
    const newValue = beforeAt + mention + textAfterCursor;

    onChange(newValue);
    setShowMentions(false);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeAt.length + mention.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions || filteredUsers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        insertMention(filteredUsers[selectedIndex]);
        break;
      case "Escape":
        setShowMentions(false);
        break;
    }
  };

  // Close mentions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionRef.current &&
        !mentionRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />

      {showMentions && filteredUsers.length > 0 && (
        <div
          ref={mentionRef}
          className="absolute z-50 w-full bottom-full mb-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted ${
                index === selectedIndex ? "bg-muted" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">{getDisplayName(user)}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
