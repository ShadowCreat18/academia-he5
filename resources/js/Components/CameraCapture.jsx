import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(null);

    // Initialize camera
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Front camera by default, can be toggled to 'environment'
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setImageSrc(dataUrl);
            stopCamera(); // Stop camera while previewing
        }
    };

    const retake = () => {
        setImageSrc(null);
        startCamera();
    };

    const confirmCapture = () => {
        if (imageSrc) {
            // Convert Base64 to Blob/File to act like an uploaded file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center text-white bg-slate-900">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Tomar Foto
                </h3>
                <button onClick={onCancel} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Camera Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {error ? (
                    <div className="p-6 text-center max-w-md bg-slate-800 rounded-2xl">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={onCancel} className="px-4 py-2 bg-slate-700 text-white rounded-lg">Volver</button>
                    </div>
                ) : (
                    <>
                        {!imageSrc ? (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover sm:object-contain bg-black"
                            />
                        ) : (
                            <img src={imageSrc} alt="Captured" className="w-full h-full object-cover sm:object-contain bg-black" />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </>
                )}
            </div>

            {/* Controls */}
            {!error && (
                <div className="p-6 pb-12 bg-slate-900 flex justify-center gap-6">
                    {!imageSrc ? (
                        <button 
                            onClick={captureImage}
                            className="w-16 h-16 rounded-full bg-white border-4 border-slate-400 hover:scale-105 transition shadow-xl"
                        />
                    ) : (
                        <>
                            <button 
                                onClick={retake}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center gap-2 transition"
                            >
                                <RefreshCw className="w-5 h-5" /> Reintentar
                            </button>
                            <button 
                                onClick={confirmCapture}
                                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2 transition"
                            >
                                <Check className="w-5 h-5" /> Usar esta foto
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
