import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Film, 
  Play, 
  Volume2 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeToBusiness, updateBusiness } from '../../services/businesses';
import { 
  uploadImage, 
  uploadVideo, 
  uploadAudio, 
  validateMediaFile 
} from '../../services/cloudinary';
import { Business } from '../../types';

export const BusinessMediaPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<'image' | 'video' | 'audio'>('image');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBusiness(effectiveBizId, (data) => {
      setBusiness(data);
    });
    return () => unsub();
  }, [effectiveBizId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const check = validateMediaFile(file, activeUploadType);
    if (!check.valid) {
      toast.error(check.error || 'Invalid file format.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (activeUploadType === 'image') {
        const res = await uploadImage(file, (pct) => setUploadProgress(pct));
        const currentGallery = business?.gallery || [];
        const nextGallery = [res.secure_url, ...currentGallery];
        await updateBusiness(effectiveBizId, { gallery: nextGallery });
        toast.success('Image successfully uploaded to Cloudinary & saved to gallery!');
      } else if (activeUploadType === 'video') {
        const res = await uploadVideo(file, (pct) => setUploadProgress(pct));
        await updateBusiness(effectiveBizId, { videoUrl: res.secure_url });
        toast.success('Property tour video uploaded to Cloudinary!');
      } else if (activeUploadType === 'audio') {
        const res = await uploadAudio(file, (pct) => setUploadProgress(pct));
        await updateBusiness(effectiveBizId, { audioUrl: res.secure_url });
        toast.success('Audio description uploaded to Cloudinary!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Check internet connection.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!business) return;
    const filtered = (business.gallery || []).filter((u) => u !== url);
    try {
      await updateBusiness(effectiveBizId, { gallery: filtered });
      toast.success('Photo removed from gallery.');
    } catch (err: any) {
      toast.error('Could not remove photo: ' + err.message);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      await updateBusiness(effectiveBizId, { videoUrl: null });
      toast.success('Video removed.');
    } catch (err: any) {
      toast.error('Failed to remove video');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cloudinary Media Gallery</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          High-performance media delivery for photos, video tours, and audio guides
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        {/* Media Type Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'image', label: 'Photo Upload (JPG, PNG, WebP)', icon: ImageIcon },
            { id: 'video', label: 'Tour Video (MP4, WebM)', icon: Video },
            { id: 'audio', label: 'Audio Guide (MP3, WAV)', icon: Music },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveUploadType(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeUploadType === item.id
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Drag / File Box */}
        <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Upload new {activeUploadType}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeUploadType === 'image' && 'Supports JPG, PNG, and WebP images up to 10MB.'}
            {activeUploadType === 'video' && 'Supports MP4 and WebM videos up to 50MB.'}
            {activeUploadType === 'audio' && 'Supports MP3 and WAV audio clips up to 25MB.'}
          </p>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div className="mt-4 max-w-xs mx-auto space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Uploading to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="inline-block cursor-pointer">
              <span className="px-5 py-2.5 rounded-xl bg-amber-500 text-navy-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Choose {activeUploadType} File</span>
              </span>
              <input
                type="file"
                accept={
                  activeUploadType === 'image'
                    ? 'image/*'
                    : activeUploadType === 'video'
                    ? 'video/mp4,video/webm'
                    : 'audio/mp3,audio/wav'
                }
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">
          Property Photo Gallery ({business?.gallery?.length || 0})
        </h3>

        {(!business?.gallery || business.gallery.length === 0) ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No gallery images uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {business.gallery.map((url, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-subtle h-48 bg-slate-100">
                <img src={url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button
                  onClick={() => handleDeleteImage(url)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Tour Section */}
      {business?.videoUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-500" /> Property Video Tour
            </h3>
            <button
              onClick={handleDeleteVideo}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Remove Video
            </button>
          </div>
          <video controls className="w-full max-w-lg rounded-xl border border-slate-200 shadow-sm">
            <source src={business.videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
};
