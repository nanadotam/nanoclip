"use client";

import { useTheme } from "next-themes";
import MDEditor from '@uiw/react-md-editor';

export default function MDPreview({ content }) {
  const { theme } = useTheme();

  return (
    <div data-color-mode={theme}>
      <MDEditor.Markdown 
        source={content} 
        className="prose dark:prose-invert max-w-none"
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
} 