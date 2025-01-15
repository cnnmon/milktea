// written by erichli (thanks eric)
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import * as React from "react";

import { cn } from "@/lib/utils";

const useAutoResizeTextarea = (
  ref: React.ForwardedRef<HTMLTextAreaElement>,
  value?: React.TextareaHTMLAttributes<HTMLTextAreaElement>["value"],
) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => textAreaRef.current!);

  const updateTextareaHeight = React.useCallback(() => {
    const ref = textAreaRef?.current;
    if (ref) {
      const scrollY = window.scrollY;
      ref.style.height = "auto";
      ref.style.height = `${ref.scrollHeight}px`;
      ref.style.overflow = "hidden";
      window.scrollTo(0, scrollY);
    }
  }, []);

  // adjust height on value changes
  React.useEffect(() => {
    updateTextareaHeight();
  }, [value, updateTextareaHeight]);

  // add event listener for "input" event
  React.useEffect(() => {
    const ref = textAreaRef?.current;
    ref?.addEventListener("input", updateTextareaHeight);

    return () => {
      ref?.removeEventListener("input", updateTextareaHeight);
    };
  }, [updateTextareaHeight]);

  return { textAreaRef };
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoSize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize, value, ...props }, ref) => {
    const { textAreaRef } = useAutoResizeTextarea(ref, value);

    return (
      <textarea
        className={cn(
          "flex w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none scroll-auto",
          className,
        )}
        rows={1}
        ref={autoSize ? textAreaRef : ref}
        value={value}
        spellCheck={false}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export default function EditorInput({
  value,
  ref,
  updateValue,
  className,
  placeholder,
  setIsSaving,
  autoSize = true,
  debounceTime = 1000,
}: {
  value: string;
  ref?: React.RefObject<HTMLTextAreaElement>;
  updateValue: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  setIsSaving?: (isSaving: boolean) => void;
  autoSize?: boolean;
  debounceTime?: number;
}) {
  const [localValue, setLocalValue] = useState(value);

  // when the convex value changes (ie: the db value changes, update the local value)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // when the local value changes, update the convex value
  const sendRequest = useCallback(
    (value: string) => {
      updateValue(value).catch(console.error);
      setIsSaving?.(false);
    },
    [updateValue, setIsSaving],
  );

  // debounce the sendRequest function to prevent multiple requests
  const debouncedSendRequest = useMemo(
    () => debounce(sendRequest, debounceTime),
    [sendRequest, debounceTime],
  );

  return (
    <Textarea
      ref={ref}
      value={localValue}
      onChange={(e) => {
        debouncedSendRequest(e.target.value);
        setLocalValue(e.target.value);
        setIsSaving?.(true);
      }}
      autoSize={autoSize}
      className={className}
      placeholder={placeholder}
    />
  );
}
