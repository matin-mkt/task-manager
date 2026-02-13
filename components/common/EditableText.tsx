"use client";

import { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  type?: "input" | "textarea";
}

export default function EditableText({
  value,
  onSave,
  className,
  type = "input",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // سینک کردن مقدار فقط زمانی که در حال ادیت نیستیم
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue.trim() && currentValue.trim() !== value) {
      onSave(currentValue);
    } else {
      // اگر خالی بود یا تغییری نکرده بود، برگرد به مقدار اصلی
      setCurrentValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // جلوگیری از خط جدید در textarea یا رفتار پیش‌فرض
      inputRef.current?.blur(); // تریگر کردن handleBlur
    }
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const InputComponent = type === "input" ? "input" : "textarea";
    return (
      <InputComponent
        ref={inputRef as any}
        className={`${className} editable-input`}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          e.stopPropagation(); // این خط مانع از رسیدن رویداد کلید به dnd-kit می‌شود
          if (e.key === "Enter") {
            e.preventDefault();
            handleBlur();
          }
          if (e.key === "Escape") {
            setCurrentValue(value);
            setIsEditing(false);
          }
        }}
        onPointerDown={(e) => e.stopPropagation()} // جلوگیری از تداخل با درگ
      />
    );
  }

  return (
    <span
      className={className}
      onClick={(e) => {
        e.stopPropagation(); // جلوگیری از تریگر شدن درگ موقع کلیک برای ادیت
        setIsEditing(true);
      }}
    >
      {value}
    </span>
  );
}
