//src/components/videoRecorder/VideoRecorder.jsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios'; // Importar Axios
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaCircle, FaStop, FaSpinner } from 'react-icons/fa';
import TimeDisplay from './TimeDisplay';
import { useToast } from '@/hooks/use-toast';
import {
  MdCloudUpload,
  MdCloudDownload,
  MdOutlineAddLink,
} from 'react-icons/md';
// Ya no importamos uploadVideoToSupabase
import useCompanyTheme from '@/store/useCompanyTheme';

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://app.salestoolspro.com';

// URL del nuevo endpoint de carga
const UPLOAD_API_ENDPOINT =
  'https://api.nevtis.com/marketplace/files/video/upload';

const VideoRecorder = () => {
  const [videoPublicLink, setVideoPublicLink] = useState('');
  const videoRef = useRef(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const timeoutRef = useRef(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const { theme } = useCompanyTheme();
  const logoUrlFromStore = theme?.logo;

  // --- useEffects para permisos, cámaras y streams (SIN CAMBIOS) ---
  useEffect(() => {
    const requestPermissionsAndGetCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        setVideoDevices(videoInputs);
        // Opcional: seleccionar la primera cámara por defecto
        // if (videoInputs.length > 0 && !selectedDeviceId) {
        //   setSelectedDeviceId(videoInputs[0].deviceId);
        // }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        toast({
          title: 'Error de Permisos',
          description:
            'No se pudo acceder a la cámara/micrófono. Verifica los permisos del navegador.',
          variant: 'destructive',
        });
      }
    };

    requestPermissionsAndGetCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewStream) {
        console.log('Cleaning up previous preview stream.');
        previewStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewStream]);

  useEffect(() => {
    let isMounted = true;

    const getStream = async () => {
      if (!selectedDeviceId) {
        if (previewStream) {
          console.log('No device selected, stopping preview stream.');
          previewStream.getTracks().forEach((track) => track.stop());
          if (isMounted) setPreviewStream(null);
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }

      console.log(`Attempting to get stream for device: ${selectedDeviceId}`);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
          audio: true,
        });

        if (isMounted) {
          console.log('New stream obtained, setting preview.');
          setPreviewStream((prev) => {
            if (prev && prev.id !== stream.id) {
              console.log('Stopping previous stream before setting new one.');
              prev.getTracks().forEach((track) => track.stop());
            }
            return stream;
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          console.log(
            'Component unmounted while getting stream, stopping tracks.'
          );
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error('Error accessing selected camera:', err);
        if (isMounted) {
          toast({
            title: 'Error de Cámara',
            description: `No se pudo acceder a la cámara seleccionada. ${err.message}`,
            variant: 'destructive',
          });
          setPreviewStream(null);
          if (videoRef.current) videoRef.current.srcObject = null;
        }
      }
    };

    getStream();

    return () => {
      isMounted = false;
      console.log('Cleanup function for device selection effect.');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId, toast]);

  // --- Hook useReactMediaRecorder (SIN CAMBIOS) ---
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    previewStream: recorderPreviewStream,
  } = useReactMediaRecorder({
    video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
    audio: true,
    blobPropertyBag: { type: 'video/mp4' },
    // askPermissionOnMount: false,
  });

  // --- useEffect para sincronizar <video> con stream (SIN CAMBIOS) ---
  useEffect(() => {
    if (videoRef.current) {
      if (status === 'recording' && recorderPreviewStream) {
        if (videoRef.current.srcObject !== recorderPreviewStream) {
          console.log('Setting video source to recorderPreviewStream');
          videoRef.current.srcObject = recorderPreviewStream;
        }
      } else if (status !== 'recording' && previewStream) {
        if (videoRef.current.srcObject !== previewStream) {
          console.log('Setting video source to previewStream');
          videoRef.current.srcObject = previewStream;
        }
      } else if (!previewStream && status !== 'recording') {
        if (videoRef.current.srcObject !== null) {
          console.log('Clearing video source (no stream available)');
          videoRef.current.srcObject = null;
        }
      }
    }
  }, [previewStream, status, recorderPreviewStream]);

  // --- Funciones handleStartRecording y handleStopRecording (SIN CAMBIOS) ---
  const handleStartRecording = () => {
    if (!selectedDeviceId && videoDevices.length > 0) {
      toast({
        title: 'Selecciona una cámara',
        description: 'Elige una cámara antes de grabar.',
        variant: 'destructive',
      });
      return;
    }
    if (!previewStream && selectedDeviceId) {
      toast({
        title: 'Esperando cámara',
        description: 'La cámara seleccionada aún no está lista.',
        variant: 'destructive',
      });
      return;
    }
    clearBlobUrl();
    setVideoPublicLink('');
    console.log('Starting recording...');
    startRecording();
  };

  const handleStopRecording = () => {
    console.log('Stopping recording manually...');
    stopRecording();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // --- Función handleUpload (MODIFICADA PARA USAR AXIOS Y LA NUEVA API) ---
  const handleUpload = async () => {
    if (!mediaBlobUrl) {
      toast({
        title: 'Error',
        description: 'No hay video grabado para subir.',
      });
      return;
    }
    if (!logoUrlFromStore) {
      toast({
        title: 'Error de Configuración',
        description:
          'Falta la URL del logo en la configuración de la compañía.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setVideoPublicLink('');
    console.log('Starting upload process to new API...');

    try {
      // 1. Obtener el Blob del video grabado
      const responseBlob = await fetch(mediaBlobUrl);
      if (!responseBlob.ok) {
        throw new Error(`Failed to fetch blob: ${responseBlob.statusText}`);
      }
      const blob = await responseBlob.blob();
      console.log('Blob obtained, size:', blob.size);

      // 2. Crear FormData y añadir el blob
      const formData = new FormData();
      // La API espera la clave 'file' para el video
      formData.append('file', blob, `video-${Date.now()}.mp4`); // Opcionalmente puedes pasar un nombre de archivo aquí

      console.log('Uploading to new API endpoint:', UPLOAD_API_ENDPOINT);

      // 3. Realizar la petición POST con Axios
      const uploadResponse = await axios.post(UPLOAD_API_ENDPOINT, formData, {
        headers: {
          // Axios setea 'Content-Type': 'multipart/form-data' automáticamente con FormData
          // Añade aquí cualquier header adicional necesario (ej: Authorization)
          // 'Authorization': `Bearer TU_TOKEN_SI_ES_NECESARIO`
        },
      });

      // 4. Procesar la respuesta de la API
      if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
        const data = uploadResponse.data;
        console.log('API Upload Response:', data);

        if (
          !data.key ||
          typeof data.key !== 'string' ||
          !data.key.includes('/')
        ) {
          throw new Error(
            'Respuesta inválida de la API: Falta o es incorrecta la clave "key".'
          );
        }

        // Extraer el nombre del archivo de la clave devuelta (ej: "videos/nombre.mp4" -> "nombre.mp4")
        const videoFilename = data.key.substring(data.key.lastIndexOf('/') + 1);
        if (!videoFilename) {
          throw new Error(
            'No se pudo extraer el nombre del archivo desde la clave de la API.'
          );
        }
        console.log('Extracted video filename from API:', videoFilename);

        // 5. Extraer el nombre del archivo del logo (Lógica SIN CAMBIOS)
        let logoFilenameIdentifier = '';
        try {
          if (typeof logoUrlFromStore !== 'string' || !logoUrlFromStore) {
            throw new Error('Invalid logo URL string.');
          }
          const parsedLogoUrl = new URL(logoUrlFromStore);
          const pathSegments = parsedLogoUrl.pathname.split('/');
          logoFilenameIdentifier = pathSegments.filter(Boolean).pop() || '';
          if (!logoFilenameIdentifier) {
            throw new Error('Could not extract logo filename from URL path.');
          }
          logoFilenameIdentifier = encodeURIComponent(logoFilenameIdentifier);
        } catch (urlError) {
          console.error('Error processing logo URL:', urlError);
          toast({
            title: 'Error de Configuración del Logo',
            description: `La URL del logo (${logoUrlFromStore}) es inválida. ${urlError.message}`,
            variant: 'destructive',
          });
          // No continuar si falla el logo
          setIsUploading(false);
          return;
        }

        // 6. Construir el link público de la aplicación (usando el nuevo videoFilename de la API)
        const encodedVideoFilename = encodeURIComponent(videoFilename);
        const pageLink = `${APP_BASE_URL}/v/${logoFilenameIdentifier}/${encodedVideoFilename}`;
        console.log('Nuevo link público generado:', pageLink);

        toast({
          title: '¡Video Subido!',
          description: `Link generado: ${pageLink}`,
        });
        setVideoPublicLink(pageLink);
      } else {
        // Axios suele lanzar error para status no 2xx, pero por si acaso
        throw new Error(
          `API Error: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }
    } catch (err) {
      console.error('Upload or link generation failed:', err);
      let errorMessage = 'Ocurrió un error inesperado.';
      if (axios.isAxiosError(err)) {
        // Error específico de Axios (red, respuesta no 2xx, etc.)
        errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Error de red o del servidor.';
        console.error('Axios error details:', err.response?.data);
      } else if (err instanceof Error) {
        // Otros errores (fetch blob, procesamiento URL logo, extracción filename API)
        errorMessage = err.message;
      }
      toast({
        title: 'Fallo la Operación de Subida',
        description: errorMessage,
        variant: 'destructive',
      });
      setVideoPublicLink('');
    } finally {
      setIsUploading(false);
      console.log('Upload process finished.');
    }
  };

  // --- Renderizado del Componente (SIN CAMBIOS ESTRUCTURALES) ---
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      {/* Card para la grabación */}
      <Card className="w-full max-w-xl shadow-md rounded-lg">
        <CardContent className="flex flex-col items-center gap-4 p-4">
          {/* Encabezado */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold text-gray-800">
              Video Record
            </h2>
            <div className="flex items-center gap-2">
              <Badge
                variant={status === 'recording' ? 'destructive' : 'outline'}
                className="capitalize text-sm px-2.5 py-0.5 rounded-full"
              >
                {status}
              </Badge>
            </div>
          </div>
          {/* Selector de Cámara */}
          {videoDevices.length > 0 && (
            <div className="w-full flex justify-end items-center gap-2 mt-2">
              <label
                htmlFor="camera-select-recorder"
                className="text-sm font-medium text-gray-600"
              >
                Cámara:
              </label>
              <select
                id="camera-select-recorder"
                className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                disabled={status === 'recording' || isUploading}
              >
                <option value="">Elegir cámara...</option>
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label ||
                      `Cámara ${device.deviceId.substring(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {videoDevices.length === 0 && status !== 'idle' && (
            <p className="text-xs text-red-600 mt-1">
              No se encontraron cámaras o faltan permisos.
            </p>
          )}
          {/* Elemento Video para Preview */}
          <div className="w-full max-w-[500px] aspect-video bg-black rounded-md border border-gray-200 overflow-hidden mt-2">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          {/* Indicador de Tiempo */}
          <div className="h-6 mt-2">
            <TimeDisplay isRecording={status === 'recording'} />
          </div>
          {/* Botones de Control */}
          <div className="flex gap-4 mt-2">
            <Button
              onClick={handleStartRecording}
              variant="default"
              disabled={
                status === 'recording' ||
                (!selectedDeviceId && videoDevices.length > 0) ||
                isUploading
              }
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
            >
              {status === 'recording' ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              ) : (
                <FaCircle className="text-red-500" />
              )}
              Record
            </Button>
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              disabled={status !== 'recording' || isUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-md disabled:opacity-50"
            >
              <FaStop />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card para Preview y Subida */}
      {mediaBlobUrl && status === 'stopped' && (
        <Card className="w-full max-w-xl mt-4 shadow-md rounded-lg">
          <CardContent className="flex flex-col items-center gap-4 p-4">
            <h3 className="text-lg font-medium self-start text-gray-700">
              Recording Preview
            </h3>
            {/* Video de Preview */}
            <div className="w-full max-w-[500px] aspect-video bg-black rounded-md border border-gray-200 overflow-hidden">
              <video
                src={mediaBlobUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>
            {/* Botones de Acción */}
            <div className="flex flex-row justify-center gap-4 w-full mt-2">
              {/* Botón Descargar */}
              <a
                href={mediaBlobUrl}
                download={`grabacion-${Date.now()}.mp4`}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                style={{
                  pointerEvents: isUploading ? 'none' : 'auto',
                  opacity: isUploading ? 0.5 : 1,
                }}
              >
                <MdCloudDownload className="inline-block mr-1" />
                Download
              </a>
              {/* Botón Subir */}
              <Button
                onClick={handleUpload}
                disabled={!mediaBlobUrl || isUploading || !logoUrlFromStore}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:bg-blue-300"
              >
                {isUploading ? (
                  <FaSpinner className="animate-spin mr-1" />
                ) : (
                  <MdCloudUpload className="inline-block mr-1" />
                )}
                {isUploading ? 'Uploading...' : 'Upload & Get Link'}
              </Button>
            </div>
            {/* Mensaje de error si falta el logo */}
            {!logoUrlFromStore && !isUploading && (
              <p className="text-red-500 text-xs mt-1 text-center">
                No se puede subir: Falta la URL del logo en la configuración.
              </p>
            )}
            {/* Input para mostrar y copiar el link generado */}
            {videoPublicLink && !isUploading && (
              <div className="flex items-center gap-2 mt-4 w-full px-2">
                <label
                  htmlFor="public-link-output"
                  className="text-sm font-medium text-gray-600 whitespace-nowrap"
                >
                  Link:
                </label>
                <input
                  id="public-link-output"
                  type="text"
                  readOnly
                  value={videoPublicLink}
                  className="flex-grow border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:outline-none"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(videoPublicLink);
                    toast({
                      title: 'Link copiado',
                      description: 'El enlace se ha copiado al portapapeles.',
                    });
                  }}
                  className="px-3 py-1.5"
                >
                  Copiar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoRecorder;
