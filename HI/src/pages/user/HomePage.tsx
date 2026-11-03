import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Utensils, 
  BedDouble, 
  Clock, 
  X, 
  Star, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BusinessCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getRecentSearches, saveRecentSearch, removeRecentSearch } from '../../services/searches';
import { subscribeToBusinesses } from '../../services/businesses';
import { Business, SearchFilter, RecentSearchItem } from '../../types';
import { CollabModal } from '../../components/common/CollabModal';
import heroBg from '../../assets/hero-bg.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Suggested popular destinations
  const popularCities = ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Rajahmundry', 'Tirupati'];

  useEffect(() => {
    setRecentSearches(getRecentSearches());

    // Subscribe to businesses
    const unsub = subscribeToBusinesses((data) => {
      setBusinesses(data);
      setLoading(false);
    }, undefined, 'all');

    return () => unsub();
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (loc?: string) => {
    const target = loc || searchQuery;
    if (target.trim()) {
      saveRecentSearch(target.trim());
      setRecentSearches(getRecentSearches());
      navigate(`/search?city=${encodeURIComponent(target.trim())}&filter=${filter}`);
    } else {
      navigate(`/search?filter=${filter}`);
    }
    setIsSearchFocused(false);
  };

  const handleRecentClick = (loc: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveRecentSearch(loc);
    navigate(`/search?city=${encodeURIComponent(loc)}&filter=${filter}`);
  };

  const handleRemoveRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeRecentSearch(id);
    setRecentSearches(updated);
  };

  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please search by city name.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        const { latitude, longitude } = pos.coords;
        // In real app, reverse geocoding translates to city/area, or coordinates search
        saveRecentSearch('Current Location');
        navigate(`/search?lat=${latitude}&lng=${longitude}&filter=${filter}&near=current`);
      },
      (err) => {
        setLocationLoading(false);
        alert('Location access was denied or is unavailable. Please type your city name manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-12">
      {/* Hero Section with Fully Covered Animated Background Image */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[520px] sm:min-h-[580px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Animated Background Image - Fully Covered */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src={heroBg || "/hero-bg.jpg"}
            alt="Luxury Resort and Dining"
            className="w-full h-full object-cover object-center animate-ken-burns filter brightness-90 contrast-[1.08]"
            loading="eager"
          />
          {/* Multi-layered cinematic gradient overlays: darkness vignette for optimal contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/80" />
          <div className="absolute inset-0 bg-slate-950/30" />

          {/* Luminous Light Sweep Effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/15 to-transparent animate-luxury-sweep pointer-events-none" />

          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-amber-500/15 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-indigo-500/15 rounded-full blur-[120px] animate-float-reverse pointer-events-none" />

          {/* Subtle Star Particle Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-5 w-full z-10">
          {/* Welcome Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold shadow-xl mx-auto animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Discover Verified Hotels & Dining Across India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">Stay & Dining</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto drop-shadow font-medium">
            Live room vacancies & verified dining availability in any unfamiliar city.
          </p>

          {/* Dominant Search Container */}
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto text-left pt-2">
            <div className={`relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl transition-all duration-200 border-2 ${
              isSearchFocused ? 'border-amber-400 ring-4 ring-amber-400/30' : 'border-white/30 hover:border-white/60'
            }`}>
              <div className="pl-4 sm:pl-5 text-slate-400">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <input
                type="text"
                placeholder="Where are you going? (e.g. Hyderabad, Visakhapatnam, MG Road)"
                className="w-full py-4 px-3 sm:px-4 text-slate-900 placeholder:text-slate-500 text-sm sm:text-base font-semibold rounded-2xl focus:outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 mr-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="pr-2 sm:pr-3">
                <Button
                  variant="amber"
                  size="md"
                  className="rounded-xl px-6 text-navy-950 font-black shadow-lg hover:shadow-amber-500/25"
                  onClick={() => handleSearchSubmit()}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Current location button shortcut */}
            <div className="flex items-center justify-between mt-3 px-1 text-xs text-slate-200">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-amber-300 hover:text-amber-200 font-semibold transition-all hover:bg-black/60"
              >
                <Navigation className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                <span>{locationLoading ? 'Locating...' : '📍 Use current location'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-slate-200">
                <span className="text-slate-300 font-medium">Popular:</span>
                {popularCities.slice(0, 3).map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSearchSubmit(city)}
                    className="hover:text-amber-300 underline decoration-slate-400 underline-offset-2 font-medium"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Search Drawer: Recent Searches & Suggestions */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in text-slate-800">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </span>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => handleRecentClick(item.location, e)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-slate-800">{item.location}</span>
                          </div>
                          <button
                            onClick={(e) => handleRemoveRecent(item.id, e)}
                            className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from history"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* City Suggestions */}
                <div className="p-4 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Recommended Cities & Hubs
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSearchSubmit(city)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 transition-colors flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter Chips: All, Food, Rooms, Both */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { id: 'all', label: 'All Places', icon: null },
              { id: 'food', label: '🍴 Food & Dining', icon: Utensils },
              { id: 'rooms', label: '🛏 Rooms & Stays', icon: BedDouble },
              { id: 'both', label: '🍴 + 🛏 Stays with Food', icon: Sparkles }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as SearchFilter)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border backdrop-blur-md ${
                  filter === tab.id
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-lg scale-105 font-bold'
                    : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:border-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Clean Contact Button (No verbose info, just single clean button) */}
          <div className="pt-4 flex items-center justify-center">
            <Link to="/contact">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95 group">
                <Phone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Need Assistance? Contact Us</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collab Modal */}
      <CollabModal isOpen={isCollabOpen} onClose={() => setIsCollabOpen(false)} />
    </div>
  );
};

