import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, CheckCircle2, Compass } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { subscribeToBusiness, updateBusiness } from '../../services/businesses';
import { Business } from '../../types';

export const BusinessLocationPage: React.FC = () => {
  const { businessId } = useAuth();
  const effectiveBizId = businessId || '';
  const { toast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(17.4474);
  const [longitude, setLongitude] = useState<number>(78.3762);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBusiness(effectiveBizId, (data) => {
      if (data) {
        setBusiness(data);
        setAddress(data.address || '');
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
      }
    });
    return () => unsub();
  }, [effectiveBizId]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser does not support geolocation.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
        toast.success('Current GPS coordinates detected!');
      },
      (err) => {
        setIsLocating(false);
        toast.error('Unable to fetch GPS position: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBusiness(effectiveBizId, {
        address,
        latitude: Number(latitude),
        longitude: Number(longitude)
      });
      toast.success('Property geographic coordinates saved!');
    } catch (err: any) {
      toast.error('Failed to save location: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Property Location & Navigation Pins</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Precision GPS coordinates ensure arriving travelers find your hotel or restaurant without confusion
        </p>
      </div>

      <form onSubmit={handleSaveLocation} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        <Input
          label="Detailed Street Address / Landmark"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(Number(e.target.value))}
            required
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            isLoading={isLocating}
            icon={<Compass className="w-4 h-4 text-amber-500" />}
          >
            Auto-Detect Device GPS
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Coordinates
          </Button>
        </div>

        {/* Live Map Preview */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Traveler Map Preview
          </div>
          <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-subtle">
            <iframe
              title="Business map preview"
              className="w-full h-full border-0"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
