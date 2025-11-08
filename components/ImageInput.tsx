import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageInputProps {
    onImageSelect: (base64Data: string, mimeType: string) => void;
    isProcessing: boolean;
}

type InputMode = 'upload' | 'scan';

const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, isProcessing }) => {
    const [mode, setMode] = useState<InputMode>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isInitializingCamera, setIsInitializingCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    // Cleanup camera on unmount or mode change
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOn(false);
    }, []);

    const handleModeChange = (newMode: InputMode) => {
        if (isProcessing) return;
        setMode(newMode);
        if (newMode === 'upload' && isCameraOn) {
            stopCamera();
        }
    };

    const handleFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const base64 = result.split(',')[1];
                if (base64) {
                    onImageSelect(base64, file.type);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Invalid file type. Please select an image.");
        }
    }, [onImageSelect]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isProcessing) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isProcessing) return;
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClickUpload = () => {
        if (!isProcessing) fileInputRef.current?.click();
    };

    const startCamera = useCallback(async () => {
        if (isProcessing || isInitializingCamera) return;
        setIsInitializingCamera(true);
        setCameraError(null);
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(true);
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError("Could not access camera. Please check permissions and try again.");
            setIsCameraOn(false);
        } finally {
            setIsInitializingCamera(false);
        }
    }, [isProcessing, isInitializingCamera]);

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            const base64 = dataUrl.split(',')[1];
            onImageSelect(base64, 'image/jpeg');
            stopCamera();
        }
    };

    const UploadIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    );
    
    const CameraIcon = ({className}: {className?: string}) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const Spinner = () => (
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
    );

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="mb-4 flex p-1 bg-slate-900 rounded-lg">
                <button
                    onClick={() => handleModeChange('upload')}
                    disabled={isProcessing}
                    className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'} disabled:opacity-50`}
                >
                    File Upload
                </button>
                <button
                    onClick={() => handleModeChange('scan')}
                    disabled={isProcessing}
                    className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'scan' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'} disabled:opacity-50`}
                >
                    Live Scan
                </button>
            </div>
            
            {mode === 'upload' ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleClickUpload}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${isDragging ? 'border-sky-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}
                        ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isProcessing} />
                    <div className="flex flex-col items-center">
                        <UploadIcon />
                        <p className="mt-2 text-slate-400">
                            <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}></video>
                        {isInitializingCamera && (
                            <div className="flex flex-col items-center text-slate-300">
                                <Spinner />
                                <span className="mt-2">Initializing camera...</span>
                            </div>
                        )}
                        {!isCameraOn && !isInitializingCamera && (
                           <div className="text-slate-500 text-center">
                                <CameraIcon className="h-16 w-16 mx-auto" />
                                <p>Camera is off</p>
                           </div>
                        )}
                    </div>

                    {cameraError && <p className="text-red-400 text-center text-sm">{cameraError}</p>}
                    
                    {!isCameraOn ? (
                        <button onClick={startCamera} disabled={isProcessing || isInitializingCamera} className="w-full flex items-center justify-center bg-slate-600 hover:bg-slate-700 disabled:bg-slate-500 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            <CameraIcon className="h-5 w-5 mr-2"/>
                            {isInitializingCamera ? 'Starting...' : 'Start Camera'}
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={captureImage} disabled={isProcessing} className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                Capture Image
                            </button>
                             <button onClick={stopCamera} disabled={isProcessing} className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                Stop Camera
                            </button>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
            )}
        </div>
    );
};

export default ImageInput;
