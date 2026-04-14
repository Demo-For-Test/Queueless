"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, ShoppingBag, ChevronRight, Zap, Trophy, Heart, MapPin, ArrowRight, QrCode, X, Store, Star, History, Megaphone, Globe, Sparkles } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/auth/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
        setSearched(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchRef.current?.blur();
    
    // If exactly one result exists (like an exact code match), go to it
    if (results.length === 1) {
      router.push(`/shop/${results[0]._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-saffron-primary rounded-xl flex items-center justify-center shadow-lg shadow-saffron-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black italic text-foreground">Queue<span className="text-saffron-primary">Less</span></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button 
              onClick={() => router.push('/history')} 
              className="p-2 sm:px-4 sm:py-2 text-sm font-black text-muted-foreground hover:text-foreground uppercase tracking-widest rounded-xl hover:bg-muted transition-all flex items-center gap-2"
            >
              <History className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">My History</span>
            </button>
            <button onClick={() => router.push('/seller/login')} className="text-sm font-black text-muted-foreground hover:text-foreground uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-muted transition-all hidden md:block">
              Seller Login
            </button>
            <Button onClick={() => router.push('/seller/register')} className="h-10 px-4 sm:px-5 rounded-xl text-xs font-black bg-saffron-primary text-white hover:bg-saffron-primary/90">
              Register Stall
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-5 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-saffron-primary/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-[100px] -z-10 opacity-60" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-saffron-primary/10 text-saffron-primary font-black text-xs uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5 fill-current" /> No More Queues
          </div>

          <h1 className="text-4xl sm:text-7xl md:text-8xl font-black text-foreground leading-tight tracking-tight italic px-4">
            Order from any<br />
            <span className="text-saffron-primary">stall</span>, instantly.
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mt-6 max-w-xl mx-auto font-medium leading-relaxed">
            Scan a QR code or enter your stall&apos;s short code to browse the menu and place your order — no queue, no wait.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl mx-auto mt-12 relative"
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-saffron-primary z-10" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Code (e.g. B743) or Shop Name"
                className="w-full h-16 pl-12 sm:pl-14 pr-24 sm:pr-32 rounded-2xl text-foreground font-medium text-sm sm:text-base bg-card border-2 border-border shadow-xl shadow-saffron-500/5 outline-none focus:border-saffron-primary/40 focus:ring-4 focus:ring-saffron-primary/10 placeholder:text-muted-foreground/30 transition-all"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-20 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-xl transition-all">
                  <X className="w-4 h-4 text-muted-foreground/40" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-11 px-5 bg-saffron-primary text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-saffron-600 active:scale-95 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Dropdown */}
          <AnimatePresence>
            {(results.length > 0 || (searched && !loading)) && query && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-3 bg-card rounded-2xl shadow-2xl shadow-saffron-900/10 border border-border overflow-hidden z-50"
              >
                {loading && (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-saffron-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
                {!loading && results.length === 0 && searched && (
                  <div className="p-6 text-center">
                    <p className="font-black text-muted-foreground/40 uppercase tracking-widest text-xs">No stalls found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-muted-foreground/30 mt-1">Check the code or try the shop name</p>
                  </div>
                )}
                {results.map((shop) => (
                  <button
                    key={shop._id}
                    onClick={() => router.push(`/shop/${shop._id}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-saffron-500/5 transition-all group border-b border-border last:border-0 text-left"
                  >
                    <div className="w-12 h-12 bg-saffron-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-saffron-primary/20 transition-all">
                      <Store className="w-6 h-6 text-saffron-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-foreground text-sm">{shop.shopName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {shop.location && (
                          <span className="text-[10px] text-muted-foreground/40 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {shop.location}
                          </span>
                        )}
                        {shop.category && (
                          <span className="text-[10px] bg-muted text-muted-foreground font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {shop.category}
                          </span>
                        )}
                        {shop.avgRating > 0 && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> {shop.avgRating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {shop.shortCode && (
                        <span className="px-3 py-1 bg-foreground text-background text-[10px] font-black rounded-xl tracking-widest">
                          {shop.shortCode}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-saffron-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* How to find a stall hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-xs text-muted-foreground/40 font-medium">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-saffron-primary" />
            Scan the QR at the stall
          </div>
          <span className="hidden sm:block text-muted-foreground/20">•</span>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-saffron-primary" />
            Enter the stall short code (e.g. <span className="font-black text-foreground bg-muted px-2 py-0.5 rounded-lg">B743</span>)
          </div>
          <span className="hidden sm:block text-muted-foreground/20">•</span>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-saffron-primary" />
            Search by shop name
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-5 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-foreground italic">Why <span className="text-saffron-primary">QueueLess?</span></h2>
            <p className="text-muted-foreground/50 mt-3 font-medium">The smarter way to order at events</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: ShoppingBag, title: "Scan & Order", desc: "Scan the QR at any stall to instantly view the menu and place your order.", color: "bg-saffron-primary/10 text-saffron-primary" },
              { icon: Trophy, title: "Live Token Tracking", desc: "Get a real-time token number and see exactly when your order is ready.", color: "bg-emerald-100 text-emerald-600" },
              { icon: Heart, title: "No More Waiting", desc: "Browse, order, and come back only when your food is ready. No standing in line.", color: "bg-blue-100 text-blue-600" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-[28px] p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground/50 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advertising Section */}
      <section className="py-24 px-5 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron-primary/10 rounded-full blur-[120px]" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-saffron-primary font-black text-[10px] uppercase tracking-widest mb-6">
              <Megaphone className="w-3.5 h-3.5" /> For Brands & Partners
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic leading-tight">
              Boost your <span className="text-gradient">Visibility.</span>
            </h2>
            <p className="text-muted-foreground/40 mt-6 text-lg font-medium max-w-lg leading-relaxed">
              Reach thousands of hungry event-goers right at their fingertips. Advertise your brand on our platform and drive traffic to your stall or website.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-black text-saffron-primary">50k+</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2">Active Users</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white">95%</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2">Engagement Rate</p>
              </div>
            </div>
          </div>

          <GlassCard className="p-10 md:p-12 bg-white/5 border-white/10 rounded-[40px] shadow-2xl">
            <h3 className="text-2xl font-black mb-8 italic">Get in touch</h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Brand Name</label>
                <input type="text" placeholder="e.g. PepsiCo" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:border-saffron-primary/40 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Contact Email</label>
                <input type="email" placeholder="marketing@brand.com" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:border-saffron-primary/40 transition-all text-sm" />
              </div>
              <Button className="w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-saffron-500/20">
                Contact Partnership Team
              </Button>
              <p className="text-center text-[10px] font-medium text-muted-foreground/40">Our team will respond within 24 hours.</p>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-foreground italic mb-5">
            Run a stall? <span className="text-saffron-primary">Join us.</span>
          </h2>
          <p className="text-muted-foreground/50 text-base font-medium mb-10 max-w-xl mx-auto">
            Set up your digital menu, get a unique QR code and short code, and let customers order right from their phone. No app needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/seller/register')} className="h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-saffron-500/20">
              Register Your Stall <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push('/seller/login')} className="h-14 px-10 rounded-2xl font-black text-sm">
              Seller Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 bg-saffron-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-black italic text-foreground">Queue<span className="text-saffron-primary">Less</span></span>
        </div>
        <p className="text-xs text-slate-gray/30 font-medium uppercase tracking-widest">Skip the line. Order smart.</p>
      </footer>
    </div>
  );
}
