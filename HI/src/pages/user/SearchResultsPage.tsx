import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Utensils, 
  BedDouble, 
  Sparkles, 
  Star, 
  Filter, 
  Navigation, 
  ChevronRight,
  AlertCircle,
  Phone,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BusinessCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { subscribeToBusinesses } from '../../services/businesses';
import { subscribeToRooms } from '../../services/rooms';
import { subscribeToFoodItems } from '../../services/food';
import { Business, SearchFilter, Room, FoodItem } from '../../types';
import { saveRecentSearch } from '../../services/searches';
import { useTheme } from '../../context/ThemeContext';
import searchBg from '../../assets/search-bg.jpg';

interface BusinessCardProps {
  biz: Business;
}

const BusinessResultCard: React.FC<BusinessCardProps> = ({ biz }) => {
  const { isDark } = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const unsubRooms = subscribeToRooms(biz.businessId, (rList) => {
      setRooms(rList);
    });
    const unsubFood = subscribeToFoodItems(biz.businessId, (fList) => {
      setFoodItems(fList);
    });

    return () => {
      unsubRooms();
      unsubFood();
    };
  }, [biz.businessId]);

  const hasRooms = (biz.totalRooms || 0) > 0 || rooms.length > 0 || biz.businessType === 'hotel' || biz.businessType === 'hotel_restaurant' || biz.businessType === 'lodge';
  const hasFood = (biz.totalFoodItems || 0) > 0 || foodItems.length > 0 || biz.businessType === 'restaurant' || biz.businessType === 'hotel_restaurant';
  const roomsAvailable = (biz.availableRooms ?? 0) > 0 || rooms.some((r) => r.isAvailable);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${biz.businessName}, ${biz.address || ''}, ${biz.city}`
  )}`;

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-200 flex flex-col group ${
      isDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={biz.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          alt={biz.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Rating */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{biz.rating || 4.5}</span>
        </div>

        {/* Business Type */}
        <div className="absolute top-3 right-3 bg-navy-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white capitalize shadow-sm">
          {biz.businessType.replace('_', ' & ')}
        </div>

        {/* Location bottom overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow-md">
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">{biz.address || `${biz.city}, ${biz.state}`}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div>
            <h3 className={`text-base font-bold transition-colors line-clamp-1 ${
              isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-amber-700'
            }`}>
              {biz.businessName}
            </h3>
            <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              {biz.description}
            </p>
          </div>

          {/* Quick contact / map directions */}
          <div className={`flex items-center gap-2 mt-3 pt-2.5 border-t text-xs ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  isDark ? 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
                title={`Call ${biz.phone}`}
              >
                <Phone className="w-3 h-3" />
                <span>Call {biz.phone}</span>
              </a>
            )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ml-auto ${
                isDark ? 'text-slate-300 bg-white/10 hover:bg-white/20' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Navigation className="w-3 h-3 text-amber-500" />
              <span>Map Directions</span>
            </a>
          </div>

          {/* Details added in business portal: Rooms preview */}
          {hasRooms && (
            <div className={`mt-3 pt-2.5 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <BedDouble className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rooms & Stays</span>
                </span>
                <span className={`text-[11px] font-bold ${roomsAvailable ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ● {roomsAvailable ? `${biz.availableRooms ?? rooms.filter((r) => r.isAvailable).length} Available` : 'Fully Booked'}
                </span>
              </div>
              {rooms.length > 0 ? (
                <div className="space-y-1">
                  {rooms.slice(0, 2).map((room) => (
                    <div key={room.roomId} className={`flex items-center justify-between text-[11px] px-2.5 py-1 rounded-md ${
                      isDark ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-700'
                    }`}>
                      <span className="font-medium truncate max-w-[150px]">{room.roomName}</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{room.pricePerNight} <span className="text-[10px] text-slate-400 font-normal">/night</span>
                      </span>
                    </div>
                  ))}
                  {rooms.length > 2 && (
                    <p className="text-[10px] text-slate-400 text-right">+{rooms.length - 2} more room types</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Verified room inventory active</p>
              )}
            </div>
          )}

          {/* Details added in business portal: Food preview */}
          {hasFood && (
            <div className={`mt-3 pt-2.5 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <Utensils className="w-3.5 h-3.5 text-amber-500" />
                  <span>Food & Dining Menu</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-500">● Dining Active</span>
              </div>
              {foodItems.length > 0 ? (
                <div className="space-y-1">
                  {foodItems.slice(0, 2).map((food) => (
                    <div key={food.foodId} className={`flex items-center justify-between text-[11px] px-2.5 py-1 rounded-md ${
                      isDark ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-700'
                    }`}>
                      <span className="font-medium truncate max-w-[150px] flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${food.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="truncate">{food.name}</span>
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{food.price}</span>
                    </div>
                  ))}
                  {foodItems.length > 2 && (
                    <p className="text-[10px] text-slate-400 text-right">+{foodItems.length - 2} more menu items</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Authentic food service active</p>
              )}
            </div>
          )}
        </div>

        {/* Pricing and Action Button */}
        <div className={`pt-3 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <div>
            {biz.startingRoomPrice ? (
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">From</span>
                <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{biz.startingRoomPrice}
                </span>
                <span className="text-[11px] text-slate-500"> / night</span>
              </div>
            ) : biz.startingFoodPrice ? (
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Meals from</span>
                <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{biz.startingFoodPrice}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Verified Listing</span>
            )}
          </div>

          <Link to={`/place/${biz.businessId}`}>
            <Button size="sm" variant="primary" className="rounded-xl px-4 text-xs font-semibold">
              View Place Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const SearchResultsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const cityParam = searchParams.get('city') || '';
  const filterParam = (searchParams.get('filter') as SearchFilter) || 'all';

  const [searchInput, setSearchInput] = useState(cityParam);
  const [filter, setFilter] = useState<SearchFilter>(filterParam);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(cityParam);
    setFilter(filterParam);
  }, [cityParam, filterParam]);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToBusinesses(
      (data) => {
        setBusinesses(data);
        setLoading(false);
      },
      cityParam || undefined,
      filter
    );

    return () => unsub();
  }, [cityParam, filter]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      saveRecentSearch(searchInput.trim());
      setSearchParams({ city: searchInput.trim(), filter });
    } else {
      setSearchParams({ filter });
    }
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    const params: any = { filter: newFilter };
    if (cityParam) params.city = cityParam;
    setSearchParams(params);
  };

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Realistic & Premium 5-Star Hotel Lobby Background with Ken-Burns Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          src={searchBg || "/search-bg.jpg"}
          alt="5-Star Grand Hotel Lobby"
          className={`w-full h-full object-cover object-center animate-ken-burns transition-all ${
            isDark ? 'brightness-[0.7] contrast-[1.08]' : 'brightness-[0.85] contrast-[1.02]'
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

      <div className="relative max-w-7xl mx-auto space-y-6 z-10">
        {/* Top Search Controls Bar */}
        <div className={`backdrop-blur-2xl rounded-2xl border p-4 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors ${
          isDark 
            ? 'bg-slate-900/85 border-white/15' 
            : 'bg-white/95 border-slate-200/90 shadow-lg'
        }`}>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <MapPin className="w-5 h-5 text-amber-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by city, area, or landmark (e.g. Hyderabad, Beach Road, Vizag)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full pl-10 pr-24 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-950/70 border-white/20 text-white placeholder:text-slate-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <Button
              type="submit"
              size="sm"
              variant="amber"
              className="absolute right-1.5 rounded-lg font-bold text-navy-950"
            >
              Find
            </Button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Places' },
              { id: 'food', label: '🍴 Food' },
              { id: 'rooms', label: '🛏 Rooms' },
              { id: 'both', label: '🍴+🛏 Both' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleFilterChange(item.id as SearchFilter)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                  filter === item.id
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md scale-105'
                    : isDark 
                      ? 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/15'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`text-xl sm:text-2xl font-black drop-shadow-md ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {cityParam ? `Places in ${cityParam}` : 'All Registered Accommodations & Dining'}
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {loading ? 'Scanning availability...' : `${businesses.length} matching places found with verified live status`}
            </p>
          </div>

          {cityParam && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams({ filter });
              }}
              className={`text-xs underline self-start sm:self-auto font-medium ${
                isDark ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              Clear location filter
            </button>
          )}
        </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-amber-500" />}
          title="No places found"
          description={`We couldn't find any hotels or restaurants matching "${cityParam || 'your criteria'}". Try searching another nearby city or reset your filters.`}
          actionText="Show All Places"
          onAction={() => {
            setSearchInput('');
            setFilter('all');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <BusinessResultCard key={biz.businessId} biz={biz} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
