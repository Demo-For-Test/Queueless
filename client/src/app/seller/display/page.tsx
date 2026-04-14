"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '@/lib/constants';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, BellRing, Clock, CheckCircle2, Volume2, ChefHat, ArrowLeft, Star, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TokenDisplayPage() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const fetchOrders = useCallback(async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/order/shop/${id}`);
      const ready = res.data
        .filter((o: any) => o.status === 'Ready')
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setReadyOrders(ready);
      if (ready.length > 0) {
        setCurrentOrder(ready[0]);
      } else {
        setCurrentOrder(null);
      }
    } catch (err) {
      console.error('Fetch orders failed:', err);
    }
  }, []);

  const playNotification = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
  };

  useEffect(() => {
    const data = localStorage.getItem('sellerData');
    if (!data) return;

    const seller = JSON.parse(data);
    const sellerId = seller._id;
    const fetchSellerData = async (id: string) => {
      try {
        const res = await axios.get(`${API_URL}/auth/shop/${id}`);
        setSeller(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchOrders(sellerId);
    fetchSellerData(sellerId);
    setCurrentTime(new Date());

    const socket = io(SOCKET_URL);
    socket.emit('join-shop', sellerId);
    
    socket.on('order-status-updated', (updatedOrder) => {
      fetchOrders(sellerId);
      if (updatedOrder.status === 'Ready') {
        playNotification();
      }
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex flex-col">
      {/* Responsive Header */}
      <header className="px-6 md:px-12 py-6 md:py-10 flex justify-between items-center bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => router.back()} className="md:hidden p-2 -ml-2 hover:bg-muted rounded-xl">
             <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-12 h-12 md:w-20 md:h-20 bg-saffron-primary rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-saffron-500/30 ring-4 md:ring-8 ring-saffron-50/10">
            <ShoppingBag className="w-6 h-6 md:w-10 md:h-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-5xl font-black tracking-tight italic text-foreground leading-none">
              {seller?.shopName || 'QueueLess'} <span className="text-saffron-primary hidden sm:inline">Display</span>
            </h1>
            <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-3">
               <span className="px-2 py-0.5 bg-saffron-primary/10 text-saffron-primary rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ring-1 ring-saffron-primary/20">Live Status</span>
               {seller?.avgRating > 0 && (
                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] md:text-[10px] font-black italic border border-emerald-500/20">
                    <Star className="w-2 h-2 md:w-3 md:h-3 fill-current" /> {seller.avgRating}
                 </div>
               )}
               <div className="flex items-center gap-1.5 md:gap-2">
                 <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest">Active</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-12">
            <ThemeToggle />
            <div className="text-right">
              {currentTime && (
                <div className="text-2xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground tabular-nums leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                </div>
              )}
              <p className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 mr-1">Current Time</p>
            </div>
            <div className="w-px h-10 md:h-16 bg-border hidden sm:block" />
            <div className="hidden sm:flex flex-col items-center justify-center">
              <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/40 mb-1" />
              <span className="text-[7px] md:text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest text-center leading-tight">Audio<br/>Enabled</span>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Animated Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron-primary/5 rounded-full blur-[150px] -z-10 animate-pulse" />
        
        {/* Left: Main Calling Area */}
        <div className="flex-[1.4] p-8 md:p-12 lg:p-24 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border relative min-h-[50vh] lg:min-h-0">
          <AnimatePresence mode="wait">
            {currentOrder ? (
              <motion.div
                key={currentOrder._id}
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="w-full text-center"
              >
                <div className="inline-flex items-center gap-2 md:gap-3 px-6 py-2 md:px-8 md:py-3 bg-red-50 text-red-500 rounded-full mb-6 md:mb-8 ring-1 ring-red-100">
                  <BellRing className="w-4 h-4 md:w-6 md:h-6 animate-bounce" />
                  <span className="text-sm md:text-xl font-black uppercase tracking-[0.2em] italic">Pick it up!</span>
                </div>

                <div className="relative inline-block mb-6 md:mb-8">
                  <div className="text-[12rem] sm:text-[18rem] md:text-[24rem] lg:text-[28rem] font-black text-foreground leading-none tracking-tighter drop-shadow-[0_25px_60px_rgba(0,0,0,0.1)] select-none">
                    {currentOrder.tokenNumber}
                  </div>
                  <div className="absolute -top-4 -right-4 md:-top-6 md:-right-12 w-16 h-16 md:w-32 md:h-32 bg-saffron-primary rounded-full flex items-center justify-center text-white scale-110 shadow-xl border-4 md:border-8 border-card">
                    <CheckCircle2 className="w-10 h-10 md:w-20 md:h-20" />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900 text-white px-8 py-4 md:px-12 md:py-6 rounded-2xl md:rounded-[40px] shadow-2xl shadow-slate-900/40 inline-flex items-center gap-3 md:gap-5"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <ChefHat className="w-4 h-4 md:w-7 md:h-7 text-saffron-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1">Customer</p>
                    <p className="text-xl md:text-3xl font-black uppercase tracking-wider">{currentOrder.customerName}</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-muted rounded-3xl md:rounded-[48px] flex items-center justify-center mx-auto mb-8 md:mb-10 animate-pulse">
                  <Clock className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/10 animate-spin-slow" />
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic px-6">
                   Ready Orders <br/> Show Here
                </h2>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Sidebar / Upcoming */}
        <div className="flex-1 bg-muted/30 p-8 md:p-12 lg:p-20 relative overflow-hidden">
          <div className="sticky top-0 z-10">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-8 md:mb-12 flex items-center gap-6">
              Also Ready <span className="h-0.5 flex-1 bg-border rounded-full" />
            </h2>
          </div>

          <div className="space-y-4 md:space-y-6 max-h-[500px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
            <AnimatePresence>
              {readyOrders.slice(1).map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="text-4xl md:text-8xl font-black text-saffron-primary group-hover:scale-110 transition-transform tracking-tight italic">
                      #{order.tokenNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/10 rounded-lg md:rounded-xl flex items-center justify-center ml-auto mb-1 md:mb-2">
                       <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-emerald-500" />
                    </div>
                    <p className="text-[10px] md:text-2xl font-black text-foreground truncate max-w-[120px] md:max-w-[180px]">{order.customerName}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {readyOrders.length <= 1 && (
              <div className="py-12 md:py-20 flex flex-col items-center justify-center opacity-10">
                <ChefHat className="w-16 h-16 md:w-24 md:h-24 mb-6" />
                <p className="font-black text-[10px] uppercase tracking-[0.5em] md:tracking-[1em]">Queue Empty</p>
              </div>
            )}
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
             <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-saffron-primary rounded-full" />
                   <p className="text-[9px] md:text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest leading-relaxed">Collect from counter</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-muted-foreground/20 rounded-full" />
                   <p className="text-[9px] md:text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest leading-relaxed">Real-time queue display</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
