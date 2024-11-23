"use client";

import { useTheme } from "next-themes";
import MDEditor from '@uiw/react-md-editor';

export default function MDEditorWrapper({ value, onChange }) {
  const { theme } = useTheme();

  return (
    <div data-color-mode={theme}>
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        height={300}
        className="bg-background w-full"
        textareaProps={{
          style: {
            backgroundColor: 'transparent'
          }
        }}
      />
    </div>
  );
} 