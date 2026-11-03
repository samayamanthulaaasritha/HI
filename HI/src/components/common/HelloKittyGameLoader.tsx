import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Trophy, X, Play, RotateCcw } from 'lucide-react';

interface FloatingItem {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage
  type: 'bow' | 'heart' | 'star';
  points: number;
  emoji: string;
}

export const HelloKittyGameLoader: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isManualPlay, setIsManualPlay] = useState(false);
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [sparkleEffect, setSparkleEffect] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const kittyYRef = useRef(0); // 0 is ground, 1 is peak of jump
  const autoCloseTimerRef = useRef<any>(null);
  const lastLocationRef = useRef(location.pathname);

  // Kitty game runs purely on demand when clicked from the corner button (not during page loading)

  // Spawn game floating collectibles
  useEffect(() => {
    if (!isVisible) return;

    const spawnInterval = setInterval(() => {
      const types: Array<{ type: 'bow' | 'heart' | 'star'; points: number; emoji: string }> = [
        { type: 'bow', points: 10, emoji: '🎀' },
        { type: 'heart', points: 15, emoji: '💖' },
        { type: 'star', points: 20, emoji: '⭐' }
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const newItem: FloatingItem = {
        id: Date.now() + Math.random(),
        x: 100, // Starts at right
        y: Math.random() > 0.5 ? 40 : 15, // Low or high floating
        ...randomType
      };

      setItems((prev) => [...prev.slice(-4), newItem]);
    }, 700);

    // Animate items moving left
    const moveInterval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({ ...item, x: item.x - 4 }))
          .filter((item) => item.x > -10)
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isVisible]);

  // Jump logic
  const handleJump = () => {
    if (isJumping) return;
    setIsJumping(true);
    kittyYRef.current = 1;

    // Check collision with items near Kitty (x between 30 and 55)
    setTimeout(() => {
      setItems((prev) => {
        const remaining: FloatingItem[] = [];
        let caughtPoints = 0;
        let caughtEmoji = '';

        for (const item of prev) {
          if (item.x >= 25 && item.x <= 65) {
            caughtPoints += item.points;
            caughtEmoji = item.emoji;
          } else {
            remaining.push(item);
          }
        }

        if (caughtPoints > 0) {
          setScore((s) => s + caughtPoints);
          setSparkleEffect(`+${caughtPoints} ${caughtEmoji}! ✨`);
          setTimeout(() => setSparkleEffect(null), 800);
        }

        return remaining;
      });
    }, 200);

    setTimeout(() => {
      setIsJumping(false);
      kittyYRef.current = 0;
    }, 550);
  };

  // Keyboard space bar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && (e.code === 'Space' || e.code === 'ArrowUp')) {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isJumping]);

  const handleClose = () => {
    setIsVisible(false);
    setIsManualPlay(false);
  };

  return (
    <>
      {/* Floating Corner Toy Button: Play with Hello Kitty anytime! */}
      <button
        onClick={() => {
          setIsManualPlay(true);
          setIsVisible(true);
        }}
        className="fixed bottom-4 right-4 z-40 bg-pink-500/90 hover:bg-pink-600 text-white px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-md border border-pink-300 flex items-center gap-2 text-xs font-black transition-all hover:scale-105 active:scale-95 group"
        title="Play Hello Kitty Mini Game"
      >
        <span className="text-base group-hover:rotate-12 transition-transform">🎀</span>
        <span>Play with Kitty</span>
      </button>

      {/* Full Page Toy Game Overlay */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md animate-fade-in p-4 select-none">
          <div className="relative w-full max-w-md bg-gradient-to-b from-pink-50 via-white to-pink-50 rounded-3xl border-4 border-pink-400 p-6 shadow-2xl overflow-hidden text-slate-800">
            {/* Top Close / Skip Button */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors z-20"
              title="Skip"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black uppercase tracking-wider">
                <span>🎀 Hello Kitty Toy Play 🐾</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5">
                Catch Floating Bows & Stars!
              </h3>
              <p className="text-xs text-slate-500">
                Tap Kitty or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-mono">Space</kbd> to jump
              </p>
            </div>

            {/* Score & Sparks Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-pink-100/70 rounded-xl mb-3 border border-pink-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-pink-800">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Score: {score}</span>
              </div>
              {sparkleEffect ? (
                <span className="text-xs font-black text-pink-600 animate-bounce">
                  {sparkleEffect}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-pink-600">
                  Tap to Jump! ✨
                </span>
              )}
            </div>

            {/* Interactive Game Arena Stage */}
            <div 
              onClick={handleJump}
              className="relative h-44 w-full bg-gradient-to-b from-sky-100 via-pink-50 to-emerald-100 rounded-2xl border-2 border-pink-200 overflow-hidden cursor-pointer shadow-inner"
            >
              {/* Cute clouds & decorative background */}
              <div className="absolute top-2 left-6 text-xl opacity-60">☁️</div>
              <div className="absolute top-4 right-10 text-xl opacity-60">☁️</div>

              {/* Floating Items */}
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  className="absolute text-2xl transition-all duration-75 pointer-events-none drop-shadow"
                >
                  {item.emoji}
                </div>
              ))}

              {/* Ground line */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-emerald-400 border-t-2 border-emerald-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-900 tracking-widest">🌸 🐾 🌸 🐾 🌸 🐾 🌸</span>
              </div>

              {/* Hello Kitty Toy SVG Character */}
              <div
                style={{
                  bottom: isJumping ? '72px' : '22px',
                  left: '42%',
                }}
                className={`absolute transition-all duration-300 ease-out flex flex-col items-center ${
                  isJumping ? '-translate-y-2 rotate-[-6deg]' : 'animate-bounce'
                }`}
              >
                {/* Hello Kitty Toy SVG */}
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-lg"
                >
                  {/* Left Ear */}
                  <path d="M 22 36 Q 16 14 36 22 Z" fill="#FFFFFF" stroke="#333333" strokeWidth="4" />
                  {/* Right Ear */}
                  <path d="M 78 36 Q 84 14 64 22 Z" fill="#FFFFFF" stroke="#333333" strokeWidth="4" />

                  {/* Head Oval */}
                  <ellipse cx="50" cy="46" rx="38" ry="30" fill="#FFFFFF" stroke="#333333" strokeWidth="4" />

                  {/* Iconic Red Bow on Left Ear */}
                  <g transform="translate(18, 14)">
                    <circle cx="16" cy="14" r="6" fill="#FF2D55" stroke="#333333" strokeWidth="2.5" />
                    {/* Left Loop */}
                    <path d="M 12 14 C 2 6, 2 22, 12 16 Z" fill="#FF2D55" stroke="#333333" strokeWidth="2.5" />
                    {/* Right Loop */}
                    <path d="M 20 14 C 30 6, 30 22, 20 16 Z" fill="#FF2D55" stroke="#333333" strokeWidth="2.5" />
                    <circle cx="15" cy="13" r="2" fill="#FFFFFF" opacity="0.6" />
                  </g>

                  {/* Left Eye */}
                  <ellipse cx="34" cy="46" rx="3.5" ry="4.5" fill="#222222" />
                  {/* Right Eye */}
                  <ellipse cx="66" cy="46" rx="3.5" ry="4.5" fill="#222222" />

                  {/* Yellow Oval Nose */}
                  <ellipse cx="50" cy="52" rx="4" ry="3" fill="#FFCC00" stroke="#333333" strokeWidth="1.5" />

                  {/* Left Whiskers */}
                  <line x1="16" y1="44" x2="28" y2="46" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="14" y1="50" x2="27" y2="50" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="16" y1="56" x2="28" y2="54" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Right Whiskers */}
                  <line x1="84" y1="44" x2="72" y2="46" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="86" y1="50" x2="73" y2="50" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="84" y1="56" x2="72" y2="54" stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Body with Cute Pink Dress */}
                  <path d="M 32 74 C 30 88, 70 88, 68 74 Z" fill="#FF4081" stroke="#333333" strokeWidth="3.5" />
                  {/* Yellow button on dress */}
                  <circle cx="50" cy="78" r="2" fill="#FFE600" />

                  {/* Paws */}
                  <ellipse cx="32" cy="85" rx="5" ry="3" fill="#FFFFFF" stroke="#333333" strokeWidth="2" />
                  <ellipse cx="68" cy="85" rx="5" ry="3" fill="#FFFFFF" stroke="#333333" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Jump Action Button */}
            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleJump}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🐾 TAP TO JUMP!</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close Game ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
