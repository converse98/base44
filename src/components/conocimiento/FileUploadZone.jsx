
import React, { useState, useCallback, useRef } from 'react';
import { UploadFile } from "@/api/integrations";
import { DataSource } from "@/api/entities";
import { Progress } from "@/components/ui/progress";
import ErrorDialog from "./ErrorDialog";
import { Upload, FileUp, X } from 'lucide-react';

// Convert MB to Bytes
const MB_IN_BYTES = 1024 * 1024;
const GB_IN_BYTES = 1024 * MB_IN_BYTES;

export default function FileUploadZone({ acceptedFormats, sourceType, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const MAX_SIZE_BYTES = 5 * GB_IN_BYTES;

  const handleFiles = useCallback((selectedFiles) => {
    const acceptedFiles = [];
    const fileRejections = [];

    // acceptedFormats is an object like { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }
    // To validate, we need to check if file.type is one of the keys in acceptedFormats
    const validMimeTypes = Object.keys(acceptedFormats);

    Array.from(selectedFiles).forEach(file => {
      let isFileTypeAccepted = false;
      if (file.type && validMimeTypes.includes(file.type)) {
        isFileTypeAccepted = true;
      } else {
        // Fallback for files without a recognized MIME type or for cases where acceptedFormats might contain extensions
        // If acceptedFormats contains extensions, this logic would need to be more sophisticated.
        // For now, assuming acceptedFormats keys are MIME types.
        for (const mimeType of validMimeTypes) {
            if (file.name.toLowerCase().endsWith(mimeType.split('/').pop().toLowerCase())) { // Simple check for common extensions
                isFileTypeAccepted = true;
                break;
            }
        }
      }

      if (!isFileTypeAccepted) {
        fileRejections.push({ file, errors: [{ code: 'file-invalid-type', message: 'Invalid file type' }] });
      } else if (file.size > MAX_SIZE_BYTES) {
        fileRejections.push({ file, errors: [{ code: 'file-too-large', message: 'File is too large' }] });
      } else {
        acceptedFiles.push(file);
      }
    });

    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setError({ title: "File Too Large", message: `File is larger than the 5 GB limit.`, onRetry: null });
      } else if (firstError.code === 'file-invalid-type') {
         setError({ title: "Invalid File Type", message: `File type not supported. Please upload one of the accepted formats.`, onRetry: null });
      } else {
        setError({ title: "Upload Error", message: firstError.message, onRetry: null });
      }
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending', // 'pending', 'uploading', 'completed', 'error'
      error: null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(handleUpload);
  }, [acceptedFormats, MAX_SIZE_BYTES]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragIn = (e) => {
    handleDrag(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragActive(true);
    }
  };
  
  const handleDragOut = (e) => {
    handleDrag(e);
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    handleDrag(e);
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Clear the input so same file can be selected again
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleUpload = async (fileWrapper) => {
    const { file } = fileWrapper;
    
    // Update status to uploading
    setFiles(prev => prev.map(fw => fw.file === file ? { ...fw, status: 'uploading' } : fw));
    
    // Simulate progress
    const progressInterval = setInterval(() => {
       setFiles(prev => prev.map(fw => {
         if (fw.file === file && fw.progress < 95) {
           return { ...fw, progress: fw.progress + 5 };
         }
         return fw;
       }));
    }, 200);

    try {
      const { file_url } = await UploadFile({ file });
      clearInterval(progressInterval);
      
      await DataSource.create({
        name: file.name,
        source_type: sourceType === 'video' && file.type.startsWith('video/') ? 'video' : sourceType === 'video' && file.type.startsWith('audio/') ? 'audio' : 'document',
        format: file.type,
        url: file_url,
        size: file.size,
        status: 'uploaded'
      });
      
      setFiles(prev => prev.map(fw => fw.file === file ? { ...fw, status: 'completed', progress: 100 } : fw));
      onUploadComplete();

    } catch (err) {
      clearInterval(progressInterval);
      console.error("Upload failed for file:", file.name, err);
      setFiles(prev => prev.map(fw => fw.file === file ? { ...fw, status: 'error', error: 'Upload failed' } : fw));
      setError({
        title: "Upload Failed",
        message: `Could not upload ${file.name}. Please try again.`,
        onRetry: () => {
          setFiles(prev => prev.filter(fw => fw.file !== file)); // Remove the failed file before retrying
          handleUpload(fileWrapper);
        }
      });
    }
  };
  
  const removeFile = (fileToRemove) => {
    setFiles(prev => prev.filter(fw => fw.file !== fileToRemove));
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-amber-500 bg-amber-50' : 'border-neutral-300 hover:border-neutral-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept={Object.keys(acceptedFormats).join(',')}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-8 h-8 text-neutral-400 mb-2" />
          <p className="font-semibold text-neutral-700">Arrastre archivos aquí</p>
          <p className="text-sm text-neutral-500">o haga clic para seleccionar</p>
          <p className="text-xs text-neutral-400 mt-2">Max 5 GB por archivo</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fw, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border rounded-md">
              <FileUp className="w-5 h-5 text-neutral-500 flex-shrink-0" />
              <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium truncate">{fw.file.name}</p>
                {fw.status === 'uploading' && <Progress value={fw.progress} className="h-1 mt-1" />}
                {fw.status === 'error' && <p className="text-xs text-red-500">{fw.error}</p>}
                {fw.status === 'completed' && <p className="text-xs text-green-600">Completado</p>}
              </div>
              <button onClick={() => removeFile(fw.file)} className="text-neutral-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <ErrorDialog
          title={error.title}
          message={error.message}
          onRetry={error.onRetry}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
