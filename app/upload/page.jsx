"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import MDEditorWrapper from '@/components/clips/MDEditorWrapper';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import clipService from '@/lib/api/clipService';
import CreateSuccess from '@/components/clips/CreateSuccess';
import { useTheme } from "next-themes";
import { PasswordInput } from '@/components/ui/password-input';
import { Progress } from '@/components/ui/progress';

export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdClipSlug, setCreatedClipSlug] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [urlSlug, setUrlSlug] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!urlSlug.trim()) {
      setError('Please enter a clip name');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const clipData = {
        url_slug: urlSlug,
        text_content: text,
        password: e.target.password.value || null,
        expire_option: e.target.expireOption.value,
        files: files
      };

      const result = await clipService.createClip(clipData, updateProgress);
      
      setCreatedClipSlug(result.url_slug);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUploadProgress({});
      setTotalProgress(0);
    }
  };

  const updateProgress = (fileName, progress) => {
    setUploadProgress(prev => {
      const newProgress = {
        ...prev,
        [fileName]: progress
      };
      
      // Calculate total progress across all files
      const total = Object.values(newProgress).reduce((acc, curr) => acc + curr, 0);
      const avgProgress = total / Object.keys(newProgress).length;
      setTotalProgress(avgProgress);
      
      return newProgress;
    });
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold">Upload Content</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <Card className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="urlSlug" className="text-sm font-medium mb-2 block">
                    Clip URL
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground whitespace-nowrap">
                      nanoclip.vercel.app/clips/
                    </span>
                    <Input
                      id="urlSlug"
                      name="urlSlug"
                      value={urlSlug}
                      onChange={(e) => setUrlSlug(e.target.value)}
                      placeholder="my-clip-name"
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="text-sm font-medium mb-2 block">
                    Password Protection (Optional)
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="Enter password to protect clip"
                    className="flex-1"
                  />
                </div>
                <div>
                  <label htmlFor="expireOption" className="text-sm font-medium mb-2 block">
                    Clip Expiry
                  </label>
                  <select
                    id="expireOption"
                    name="expireOption"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    defaultValue="1m"
                  >
                    <option value="1m">1 minute</option>
                    <option value="10m">10 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="5h">5 hours</option>
                    <option value="12h">12 hours</option>
                    <option value="1d">1 day</option>
                  </select>
                </div>
              </div>
            </Card>

            <MDEditorWrapper value={text} onChange={setText} />

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
                    <li 
                      key={index} 
                      className="flex flex-col gap-2 p-2 hover:bg-muted/50 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                          <span className="text-foreground font-medium truncate">
                            {file.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            const newFiles = [...files];
                            newFiles.splice(index, 1);
                            setFiles(newFiles);
                            // Also clear progress
                            const newProgress = { ...uploadProgress };
                            delete newProgress[file.name];
                            setUploadProgress(newProgress);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {uploadProgress[file.name] !== undefined && (
                        <div className="space-y-1">
                          <Progress value={uploadProgress[file.name]} />
                          <p className="text-xs text-muted-foreground text-right">
                            {Math.round(uploadProgress[file.name])}%
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            {isLoading && (
              <Card className="p-4">
                <div className="space-y-2">
                  <Progress value={totalProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading files...</span>
                    <span>{Math.round(totalProgress)}%</span>
                  </div>
                </div>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">Creating Clip...</span>
                  {totalProgress > 0 && <span>{Math.round(totalProgress)}%</span>}
                </div>
              ) : (
                'Create Clip'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
      
      {showSuccess && (
        <CreateSuccess 
          clipSlug={createdClipSlug}
          onClose={() => {
            setShowSuccess(false);
            router.push('/');
          }}
        />
      )}
    </>
  );
} 