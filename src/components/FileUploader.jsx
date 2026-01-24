import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image, FileText, Video, X, CheckCircle } from 'lucide-react';

const FileUploader = ({ 
  onUploadComplete,
  uploadType = 'single', // 'single', 'multiple', 'image', 'video', 'pdf'
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState('');

  // File type configurations
  const fileTypeConfigs = {
    single: {
      accept: '*/*',
      fieldName: 'file',
      endpoint: '/api/upload/single'
    },
    multiple: {
      accept: '*/*',
      fieldName: 'files',
      endpoint: '/api/upload/multiple'
    },
    image: {
      accept: 'image/*',
      fieldName: 'image',
      endpoint: '/api/upload/image'
    },
    video: {
      accept: 'video/*',
      fieldName: 'video',
      endpoint: '/api/upload/video'
    },
    pdf: {
      accept: '.pdf,application/pdf',
      fieldName: 'document',
      endpoint: '/api/upload/pdf'
    }
  };

  const config = fileTypeConfigs[uploadType];

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`;
    }

    // Check file type for specific types
    if (uploadType === 'image' && !file.type.startsWith('image/')) {
      return `File ${file.name} is not an image.`;
    }

    if (uploadType === 'video' && !file.type.startsWith('video/')) {
      return `File ${file.name} is not a video.`;
    }

    if (uploadType === 'pdf' && file.type !== 'application/pdf') {
      return `File ${file.name} is not a PDF.`;
    }

    return null;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setError('');

    if (uploadType === 'single') {
      // For single upload, only take the first file
      const file = files[0];
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setSelectedFiles([file]);
      }
    } else {
      // For multiple uploads
      const validFiles = [];
      const errors = [];

      files.forEach(file => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join(' '));
      }

      // Limit to maxFiles
      const finalFiles = validFiles.slice(0, maxFiles);
      setSelectedFiles(finalFiles);

      if (finalFiles.length < validFiles.length) {
        setError(prev => prev + ` Only ${maxFiles} files allowed.`);
      }
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append(config.fieldName, file);

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: formData,
        // Add authentication headers if needed
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('token')}`
        // }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults([]);
    setError('');

    try {
      if (uploadType === 'single') {
        // Single file upload
        const result = await uploadFile(selectedFiles[0]);
        setUploadResults([result]);
        setUploadProgress(100);
        
        if (onUploadComplete) {
          onUploadComplete([result]);
        }
      } else {
        // Multiple file upload
        const results = [];
        const totalFiles = selectedFiles.length;

        for (let i = 0; i < selectedFiles.length; i++) {
          try {
            const result = await uploadFile(selectedFiles[i]);
            results.push(result);
            
            // Update progress
            setUploadProgress(((i + 1) / totalFiles) * 100);
          } catch (fileError) {
            console.error(`Failed to upload ${selectedFiles[i].name}:`, fileError);
          }
        }

        setUploadResults(results);
        
        if (onUploadComplete) {
          onUploadComplete(results);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadIcon = () => {
    switch (uploadType) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getUploadIcon()}
          File Upload
        </CardTitle>
        <CardDescription>
          {uploadType === 'single' 
            ? 'Upload a single file'
            : `Upload up to ${maxFiles} files (max ${maxSize / (1024 * 1024)}MB each)`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            Select Files
          </Label>
          <Input
            id="file-upload"
            type="file"
            multiple={uploadType !== 'single'}
            accept={config.accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="cursor-pointer"
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Upload Successful
            </h4>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm">
                    <div className="font-medium">{result.originalFilename}</div>
                    <div className="text-green-700 break-all">{result.url}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Public ID: {result.publicId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploader;