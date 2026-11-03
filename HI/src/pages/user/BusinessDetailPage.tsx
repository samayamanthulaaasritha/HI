import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Navigation, 
  Star, 
  BedDouble, 
  Utensils, 
  Clock, 
  Check, 
  Users, 
  Wifi, 
  Tv, 
  Wind, 
  AlertCircle, 
  Share2, 
  ExternalLink,
  ChevronLeft,
  Coffee,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { subscribeToBusiness, getBusinessById } from '../../services/businesses';
import { subscribeToRooms } from '../../services/rooms';
import { subscribeToFoodItems } from '../../services/food';
import { Business, Room, FoodItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import detailBg from '../../assets/detail-bg.jpg';

export const BusinessDetailPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { toast } = useToast();
  const { isDark } = useTheme();

  const [business, setBusiness] = useState<Business | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'rooms' | 'food' | 'location' | 'gallery'>('all');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>('all');

  useEffect(() => {
    if (!businessId) return;

    setLoading(true);

    // 1. Subscribe to business
    const unsubBiz = subscribeToBusiness(businessId, (biz) => {
      setBusiness(biz);
      setLoading(false);
    });

    // 2. Subscribe to rooms (Real-time availability updates!)
    const unsubRooms = subscribeToRooms(businessId, (roomList) => {
      setRooms(roomList);
    });

    // 3. Subscribe to food items (Real-time menu updates!)
    const unsubFood = subscribeToFoodItems(businessId, (foodList) => {
      setFoodItems(foodList);
    });

    return () => {
      unsubBiz();
      unsubRooms();
      unsubFood();
    };
  }, [businessId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business?.businessName,
        text: `Check out ${business?.businessName} on HotelInfo!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10 text-rose-500" />}
          title="Business Not Found"
          description="The hotel or restaurant you requested is either inactive or does not exist."
          actionText="Back to Directory"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  // Derive food categories
  const categories = ['all', ...Array.from(new Set(foodItems.map((f) => f.category)))];
  const filteredFood = selectedFoodCategory === 'all' 
    ? foodItems 
    : foodItems.filter((f) => f.category === selectedFoodCategory);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${business.businessName}, ${business.address}, ${business.city}`
  )}`;

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] space-y-8 pb-16 overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Realistic & Premium Penthouse Terrace & Skyline Background with Ken-Burns Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          src={detailBg || "/detail-bg.jpg"}
          alt="Luxury Penthouse Suite and Skyline"
          className={`w-full h-full object-cover object-center animate-ken-burns transition-all ${
            isDark ? 'brightness-[0.68] contrast-[1.08]' : 'brightness-[0.85] contrast-[1.02]'
          }`}
          loading="eager"
        />
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/90' 
            : 'bg-gradient-to-b from-white/90 via-slate-50/85 to-white/95'
        }`} />
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-950/30' : 'bg-white/20'}`} />
        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/10 to-transparent animate-luxury-sweep pointer-events-none" />
      </div>

      {/* Top Breadcrumb */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 z-10">
        <Link
          to="/search"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </Link>
      </div>

      {/* Hero Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/15">
          {/* Main Cover */}
          <div className="h-72 sm:h-96 w-full relative">
            <img
              src={business.coverImage}
              alt={business.businessName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            
            {/* Share button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-transform active:scale-95"
              title="Share business"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Information Overlay */}
          <div className="relative p-6 sm:p-8 -mt-20 text-white space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-amber-500 text-navy-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {business.businessType.replace('_', ' & ')}
              </span>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{business.rating} / 5.0</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Availability Active
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {business.businessName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{business.address}, {business.city}, {business.state}</span>
              </p>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {business.phone && (
                <a href={`tel:${business.phone}`}>
                  <Button size="sm" variant="amber" icon={<Phone className="w-3.5 h-3.5" />}>
                    Call Business
                  </Button>
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`}>
                  <Button size="sm" variant="secondary" icon={<Mail className="w-3.5 h-3.5" />}>
                    Email
                  </Button>
                </a>
              )}
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" icon={<Navigation className="w-3.5 h-3.5 text-amber-400" />}>
                  Directions on Maps
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-xl border overflow-x-auto scrollbar-none shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/85 border-white/15' : 'bg-white/95 border-slate-200/90 shadow-md'
        }`}>
          {[
            { id: 'all', label: 'Overview' },
            { id: 'rooms', label: `Rooms & Stays (${rooms.length})` },
            { id: 'food', label: `Food & Dining (${foodItems.length})` },
            { id: 'location', label: 'Location & Map' },
            { id: 'gallery', label: `Gallery (${business.gallery?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md font-black scale-105'
                  : isDark
                    ? 'bg-transparent text-slate-300 hover:text-white hover:bg-white/10 border-transparent'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Overview Tab Details */}
        {(activeTab === 'all' || activeTab === 'rooms') && rooms.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-2 drop-shadow-md ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <BedDouble className="w-5 h-5 text-amber-400" /> Available Rooms & Stay Types
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Live inventory reported directly by hotel front desk
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const isAvail = room.isAvailable && room.availabilityStatus !== 'Fully Booked' && room.availabilityStatus !== 'Unavailable';
                
                return (
                  <div
                    key={room.roomId}
                    className={`rounded-2xl border overflow-hidden shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between ${
                      isDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div>
                      {/* Room Image */}
                      <div className="relative h-44 w-full bg-slate-100">
                        <img
                          src={room.images?.[0] || business.coverImage}
                          alt={room.roomName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400">
                          {room.roomType} Room
                        </div>

                        {/* Availability Pill */}
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md shadow-sm flex items-center gap-1 ${
                          room.availabilityStatus === 'Available'
                            ? 'bg-emerald-500/90 text-white'
                            : room.availabilityStatus === 'Limited'
                            ? 'bg-amber-500/90 text-navy-950'
                            : 'bg-rose-500/90 text-white'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{room.availabilityStatus || (isAvail ? 'Available' : 'Unavailable')}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{room.roomName}</h3>
                          <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{room.capacity} Guests</span>
                            </span>
                            <span>•</span>
                            <span className="font-medium text-emerald-500">
                              {room.availableRooms} rooms left
                            </span>
                          </div>
                          <p className={`text-xs mt-1.5 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                            {room.description}
                          </p>
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className={`flex flex-wrap gap-1.5 pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                            {room.amenities.slice(0, 4).map((amenity, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                  isDark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                ✓ {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Call to Reserve */}
                    <div className={`p-4 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10 bg-slate-800/40' : 'border-slate-100 bg-slate-50/50'
                    }`}>
                      <div>
                        <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{room.pricePerNight}</span>
                        <span className="text-[10px] text-slate-400"> / night</span>
                      </div>
                      {business.phone ? (
                        <a href={`tel:${business.phone}`}>
                          <Button size="sm" variant={isAvail ? 'primary' : 'outline'} className="rounded-xl text-xs">
                            {isAvail ? 'Call to Book' : 'Inquire'}
                          </Button>
                        </a>
                      ) : (
                        <Badge variant={isAvail ? 'success' : 'danger'}>
                          {isAvail ? 'Available' : 'Unavailable'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Food Section */}
        {(activeTab === 'all' || activeTab === 'food') && foodItems.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-2 drop-shadow-md ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Utensils className="w-5 h-5 text-amber-400" /> Food Menu & Availability
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Authentic fresh dining prepared by in-house kitchen
                </p>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFoodCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      selectedFoodCategory === cat
                        ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md font-black'
                        : isDark
                          ? 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/15'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFood.map((food) => (
                <div
                  key={food.foodId}
                  className={`rounded-2xl border p-3.5 shadow-subtle hover:shadow-premium transition-all flex gap-3.5 items-center ${
                    isDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {/* Food Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`w-3 h-3 rounded-full border border-white flex items-center justify-center ${
                        food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`} title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
                    </div>
                  </div>

                  {/* Food Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isDark ? 'text-amber-300 bg-amber-500/20' : 'text-amber-800 bg-amber-50'
                      }`}>
                        {food.category}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        food.isAvailable ? 'text-emerald-500' : 'text-slate-400'
                      }`}>
                        {food.isAvailable ? '● Available' : 'Currently Unavailable'}
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm mt-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{food.name}</h4>
                    <p className={`text-xs line-clamp-1 mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{food.description}</p>
                    
                    <div className={`flex items-center justify-between mt-2 pt-1.5 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{food.price}</span>
                      {food.preparationTime && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {food.preparationTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location Section */}
        {(activeTab === 'all' || activeTab === 'location') && (
          <section className={`rounded-3xl border p-6 sm:p-8 shadow-subtle space-y-6 ${
            isDark ? 'bg-slate-900/95 border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <MapPin className="w-5 h-5 text-amber-500" /> Business Location & Transit Directions
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  Reach the property easily with exact geographic coordinates
                </p>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="amber" icon={<Navigation className="w-4 h-4 text-navy-950" />}>
                  Navigate in Google Maps
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address Details</div>
                <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {business.address}
                </p>
                <div className={`text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  <div><span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>City:</span> {business.city}</div>
                  <div><span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>State:</span> {business.state}</div>
                  <div><span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Country:</span> {business.country}</div>
                  <div><span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Timings:</span> {business.timings || '24 Hours Open'}</div>
                </div>
              </div>

              {/* Map Preview iframe / visual card */}
              <div className="md:col-span-2 h-64 rounded-2xl overflow-hidden border border-slate-200/50 bg-slate-100 relative">
                <iframe
                  title="Business location map"
                  className="w-full h-full border-0"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${business.latitude || 17.44},${business.longitude || 78.38}&z=15&output=embed`}
                />
              </div>
            </div>
          </section>
        )}

        {/* Gallery Tab */}
        {(activeTab === 'gallery') && (
          <section className="space-y-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Photo & Media Gallery</h2>
            {business.gallery && business.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {business.gallery.map((img, idx) => (
                  <div key={idx} className="h-56 rounded-2xl overflow-hidden shadow-subtle bg-slate-100">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No additional photos uploaded yet.</p>
            )}

            {business.videoUrl && (
              <div className="pt-6 space-y-2">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Property Tour Video</h3>
                <video controls className="w-full max-w-xl rounded-2xl border border-slate-200 shadow-subtle">
                  <source src={business.videoUrl} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
