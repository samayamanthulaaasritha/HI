import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Sparkles, 
  Send, 
  MessageSquare, 
  CheckCircle2,
  Building2,
  Clock,
  Compass
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { submitCollabInquiry } from '../../services/collab';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import contactBg from '../../assets/contact-bg.jpg';

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const { isDark } = useTheme();
  const [topic, setTopic] = useState<'traveler' | 'business'>('traveler');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please enter your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (topic === 'business') {
        await submitCollabInquiry({
          businessName: formData.name,
          ownerName: formData.name,
          email: formData.email,
          phone: formData.phone || '+91 0000000000',
          city: formData.city || 'Not specified',
          businessType: 'hotel_restaurant',
          message: formData.message
        });
      }
      setSubmitted(true);
      toast.success('Your message has been sent to our concierge desk!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      {/* Realistic & Premium Concierge Background Image with Ken-Burns Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          src={contactBg || "/contact-bg.jpg"}
          alt="5-Star Concierge Desk"
          className="w-full h-full object-cover object-center animate-ken-burns filter brightness-[0.75] contrast-[1.08]"
          loading="eager"
        />
        {/* Cinematic gradients for crystal-clear readability in both light & dark */}
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/90' 
            : 'bg-gradient-to-b from-white/85 via-white/80 to-slate-100/95'
        }`} />
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-950/30' : 'bg-white/20'}`} />

        {/* Luminous light sweep and ambient warm glow */}
        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/10 to-transparent animate-luxury-sweep pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-float-reverse pointer-events-none" />
      </div>

      <div className="relative max-w-4xl w-full mx-auto space-y-8 z-10">
        {/* Header (Clean, no fluff) */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold shadow-xl ${
            isDark ? 'bg-white/10 border-white/20 text-amber-300' : 'bg-amber-100/80 border-amber-300 text-amber-900'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>24/7 Concierge & Traveler Support</span>
          </div>
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            How Can We Assist You?
          </h1>
          <p className={`text-sm sm:text-base max-w-lg mx-auto font-medium ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Direct helpline and instant messaging for travelers and hotel partners.
          </p>
        </div>

        {/* Useful Direct Contact Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="tel:+918004444636"
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all group flex items-center gap-3.5 shadow-xl ${
              isDark 
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-white/15 hover:border-amber-400/50 text-white' 
                : 'bg-white/95 hover:bg-white border-slate-200/90 hover:border-amber-400/70 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toll-Free Helpline</div>
              <div className={`text-sm font-black group-hover:text-amber-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>+91 800-444-INFO</div>
            </div>
          </a>

          <a
            href="https://wa.me/919876543210?text=Hello%20HotelInfo%20Support,%20I%20need%20assistance."
            target="_blank"
            rel="noopener noreferrer"
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all group flex items-center gap-3.5 shadow-xl ${
              isDark 
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-white/15 hover:border-emerald-400/50 text-white' 
                : 'bg-white/95 hover:bg-white border-slate-200/90 hover:border-emerald-500/70 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live WhatsApp</div>
              <div className="text-sm font-black text-emerald-500">+91 98765 43210</div>
            </div>
          </a>

          <a
            href="mailto:support@hotelinfo.com"
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all group flex items-center gap-3.5 shadow-xl ${
              isDark 
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-white/15 hover:border-blue-400/50 text-white' 
                : 'bg-white/95 hover:bg-white border-slate-200/90 hover:border-blue-500/70 text-slate-900'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Helpdesk Email</div>
              <div className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>support@hotelinfo.com</div>
            </div>
          </a>
        </div>

        {/* Concise & Useful Message Form Card */}
        <div className="bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl">
          {submitted ? (
            <div className="py-10 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-white">Inquiry Received</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Thank you! Our concierge support team has received your message and will reach out shortly.
              </p>
              <Button
                variant="outline"
                size="md"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', city: '', message: '' });
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Useful topic toggle */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setTopic('traveler')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    topic === 'traveler'
                      ? 'bg-amber-500 text-navy-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Traveler Assistance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopic('business')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    topic === 'business'
                      ? 'bg-amber-500 text-navy-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Business Collaboration</span>
                </button>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {topic === 'business' ? 'Business / Manager Name' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={topic === 'business' ? 'e.g. Royal Grand Hotel' : 'e.g. Rahul Sharma'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone / Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98480 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City / Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, Visakhapatnam"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    topic === 'business'
                      ? 'Tell us about your property rooms capacity, food menus, or partnership inquiry...'
                      : 'How can we help with your room booking, menu details, or destination stay?'
                  }
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Typical response time: under 15 minutes</span>
                </div>
                <Button
                  type="submit"
                  variant="amber"
                  size="md"
                  className="w-full sm:w-auto px-8 rounded-xl font-black text-navy-950 shadow-lg"
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
