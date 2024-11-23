"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';

export default function UploadPage() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 md:space-y-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold">Upload Content</h1>
        
        <Card className="p-4 md:p-6">
          <MDEditor
            value={text}
            onChange={setText}
            preview="edit"
            height={300}
            className="bg-background w-full"
          />
        </Card>

        <Card 
          {...getRootProps()}
          className={`p-6 md:p-8 border-2 border-dashed ${
            isDragActive ? 'border-primary' : 'border-muted'
          } text-center cursor-pointer transition-colors duration-200`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            or click to select files
          </p>
        </Card>

        {files.length > 0 && (
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Uploaded Files</h2>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 hover:bg-muted/50 rounded-lg">
                  <span className="text-foreground font-medium truncate">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 