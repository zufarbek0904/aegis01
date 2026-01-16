import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Image, 
  FileText, 
  Video, 
  X, 
  Upload,
  File,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
}

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (files: { url: string; type: string; name: string }[]) => void;
  type: 'photo' | 'video' | 'file';
}

export function MediaUploadDialog({ open, onOpenChange, onUploadComplete, type }: MediaUploadDialogProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = type === 'photo' 
    ? 'image/*' 
    : type === 'video' 
      ? 'video/*' 
      : '*/*';

  const title = type === 'photo' 
    ? 'Отправить фото' 
    : type === 'video' 
      ? 'Отправить видео' 
      : 'Отправить файл';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: FileUploadItem[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;
    setUploading(true);

    const uploadedFiles: { url: string; type: string; name: string }[] = [];

    for (const fileItem of files) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
      ));

      try {
        const fileExt = fileItem.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 50));
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: i } : f
          ));
        }

        // In a real app, upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('chat-media')
        //   .upload(fileName, fileItem.file);

        const mockUrl = fileItem.preview || `https://placeholder.com/${fileName}`;
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'done' as const, url: mockUrl } : f
        ));

        uploadedFiles.push({
          url: mockUrl,
          type: fileItem.file.type.startsWith('image/') ? 'photo' : 
                fileItem.file.type.startsWith('video/') ? 'video' : 'file',
          name: fileItem.file.name
        });
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' as const } : f
        ));
      }
    }

    setUploading(false);
    
    if (uploadedFiles.length > 0) {
      onUploadComplete(uploadedFiles);
      onOpenChange(false);
      setFiles([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              'hover:border-primary hover:bg-primary/5',
              files.length > 0 ? 'border-primary/50' : 'border-muted'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Нажмите для выбора или перетащите файлы
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Максимум 20 МБ на файл
            </p>
          </div>

          {/* Files List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 max-h-[300px] overflow-y-auto"
              >
                {files.map((fileItem, index) => {
                  const Icon = getFileIcon(fileItem.file);
                  
                  return (
                    <motion.div
                      key={fileItem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
                    >
                      {/* Preview */}
                      {fileItem.preview ? (
                        <img 
                          src={fileItem.preview} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{fileItem.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        
                        {/* Progress */}
                        {fileItem.status === 'uploading' && (
                          <Progress value={fileItem.progress} className="h-1 mt-2" />
                        )}
                      </div>

                      {/* Status/Remove */}
                      {fileItem.status === 'uploading' ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : fileItem.status === 'done' ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="p-1 hover:bg-secondary rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {files.length > 0 && (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setFiles([])}
                className="flex-1"
                disabled={uploading}
              >
                Очистить
              </Button>
              <Button 
                onClick={uploadFiles}
                className="flex-1"
                disabled={uploading || files.every(f => f.status === 'done')}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  `Отправить (${files.length})`
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
