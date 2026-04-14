"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { API_URL, SOCKET_URL } from '@/lib/constants';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Clock, MapPin, ChevronLeft, Package, Sparkles, Star, Store, Printer, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function OrderTrackingPage() {
  const { orderId, shopId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/order/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const socket = io(SOCKET_URL);
    socket.emit('join-shop', shopId);
    
    socket.on('order-status-updated', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => { socket.disconnect(); };
  }, [orderId, shopId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
       <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
         className="w-16 h-16 border-4 border-saffron-primary border-t-transparent rounded-full shadow-lg"
       />
       <p className="mt-6 font-black text-muted-foreground animate-pulse space-x-1">
         <span>Tracking Status...</span>
       </p>
    </div>
  );

  if (!order) return <div className="min-h-screen flex items-center justify-center font-bold">Order not found</div>;

  const steps = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[400px] h-[400px] bg-saffron-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <header className="fixed top-0 left-0 w-full p-6 z-30 flex justify-between items-center pointer-events-none">
         <button onClick={() => router.push('/')} className="p-4 glass rounded-2xl shadow-lg hover:bg-muted transition-all pointer-events-auto">
            <ChevronLeft className="w-6 h-6 text-foreground" />
         </button>
         <div className="flex items-center gap-3 pointer-events-auto">
           <ThemeToggle />
           <button onClick={() => router.push('/history')} className="p-4 glass rounded-2xl shadow-lg hover:bg-muted transition-all flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">History</span>
           </button>
         </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-32 flex flex-col items-center">
         <motion.div 
           initial={{ scale: 0, rotate: -20 }} 
           animate={{ scale: 1, rotate: 0 }}
           className="w-24 h-24 bg-linear-to-br from-saffron-primary to-saffron-secondary rounded-[32px] flex items-center justify-center shadow-2xl shadow-saffron-500/30 mb-8 relative"
         >
            <AnimatePresence mode="wait">
               {order.status === 'Ready' || order.status === 'Completed' ? (
                 <motion.div key="ready" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Sparkles className="w-12 h-12 text-white" />
                 </motion.div>
               ) : (
                 <motion.div key="wait" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Package className="w-12 h-12 text-white" />
                 </motion.div>
               )}
            </AnimatePresence>
            {order.status === 'Ready' && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-card flex items-center justify-center"
              >
                 <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
             )}
         </motion.div>

         <h1 className="text-4xl font-black text-slate-900 text-center tracking-tight">
            Order <span className="text-gradient">#{order.tokenNumber}</span>
         </h1>
         <p className="text-slate-gray/60 mt-2 font-medium">Sit back, we&apos;re on it!</p>

         <GlassCard className="w-full mt-10 border-white p-8 md:p-10 shadow-2xl space-y-10 relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[48px]">
            <div className={`text-center px-6 py-4 rounded-3xl text-sm font-black uppercase tracking-widest ${
              order.status === 'Ready' ? 'bg-emerald-500 text-white animate-bounce' : 
              order.status === 'Completed' ? 'bg-slate-900 text-white' : 'bg-saffron-primary/10 text-saffron-primary'
            }`}>
               {order.status === 'Ready' ? '🎉 Order is Ready!' : order.status === 'Completed' ? '✅ Handed Over' : `Progress: ${order.status}`}
            </div>

            {/* Stepper */}
            <div className="space-y-8 relative">
                <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-900/5 -z-10" />
                {steps.map((step, idx) => {
                  const isActive = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;
                  return (
                    <div key={step} className="flex items-center gap-6">
                       <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-700 ${isActive ? 'bg-saffron-primary text-white shadow-lg shadow-saffron-500/20' : 'bg-slate-100 text-slate-gray/30'}`}>
                          {idx < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                       </div>
                       <div className="flex flex-col">
                          <span className={`text-sm font-black tracking-wide transition-all duration-700 ${isActive ? 'text-slate-900' : 'text-slate-gray/20'}`}>
                             {step}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-black tracking-widest text-saffron-primary mt-0.5">Live Update</span>
                          )}
                       </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-8 border-t border-slate-gray/5 grid grid-cols-2 gap-4">
               <div className="bg-slate-50/50 p-4 rounded-[24px]">
                  <Clock className="w-5 h-5 text-saffron-primary mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray/40">Status</p>
                  <p className="text-sm font-bold text-slate-900">{order.status}</p>
               </div>
               <div className="bg-slate-50/50 p-4 rounded-[24px]">
                  <MapPin className="w-5 h-5 text-saffron-primary mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray/40">Location</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{(order.sellerId as any)?.location || 'Counter'}</p>
               </div>
            </div>

             {order.status === 'Completed' && (
               <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                  {!order.rating && (
                    <div className="flex flex-col items-center">
                       <div className="flex justify-center gap-2 mb-6 text-center">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-saffron-primary/20" />)}
                       </div>
                       <Button onClick={() => router.push('/history')} className="w-full h-14 rounded-2xl font-black text-sm">
                          Rate Order & Review
                       </Button>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => router.push(`/invoice/${order._id}`)} className="w-full h-14 rounded-2xl font-black text-sm border-slate-100 flex items-center justify-center gap-2">
                     <Printer className="w-4 h-4" /> View Invoice
                  </Button>
               </div>
             )}
         </GlassCard>

         <div className="mt-12 w-full px-4 text-center">
            {order.status !== 'Completed' ? (
              <>
                <p className="text-sm text-slate-gray/60 leading-relaxed max-w-[280px] mx-auto mb-8">
                   We&apos;ll notify the stall display when your food is ready. Please watch the screen!
                </p>
                <Button variant="outline" className="w-full h-16 rounded-[24px] border-slate-200 text-xs font-black uppercase tracking-widest bg-white" onClick={() => window.location.reload()}>
                   Refresh For Updates
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/')} className="w-full h-16 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest">
                 Back to Marketplace
              </Button>
            )}
         </div>
      </main>
    </div>
  );
}
