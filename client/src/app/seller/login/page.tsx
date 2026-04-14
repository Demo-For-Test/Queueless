"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, Zap, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      localStorage.setItem('sellerToken', res.data.token);
      localStorage.setItem('sellerData', JSON.stringify(res.data.seller));
      router.push('/seller/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-saffron-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header with Back button and Theme Toggle */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <Link href="/" className="p-3 glass rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
           <div className="w-16 h-16 bg-linear-to-br from-saffron-primary to-saffron-secondary rounded-2xl flex items-center justify-center shadow-2xl shadow-saffron-500/30 mb-6">
              <ShoppingBag className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-4xl font-black text-foreground tracking-tight text-center">
              Welcome Back to <br />
              <span className="text-gradient">QueueLess</span>
           </h1>
           <p className="text-muted-foreground/60 mt-4 font-medium text-center">Continue managing your stall & orders.</p>
        </div>

        <GlassCard className="p-12 md:p-14 border-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[48px] ring-1 ring-border">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Merchant Email</label>
              <div className="relative">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                 <Input 
                   type="email" 
                   placeholder="owner@queueless.com" 
                   value={formData.email} 
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="pl-14 h-16 rounded-3xl"
                   required
                 />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Secure Password</label>
                 <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-saffron-primary hover:underline">Reset Access?</Link>
              </div>
              <div className="relative">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                 <Input 
                   type="password" 
                   placeholder="••••••••" 
                   value={formData.password} 
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   className="pl-14 h-16 rounded-3xl"
                   required
                 />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 rounded-[32px] text-lg"
            >
              Enter Dashboard <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
               </div>
               <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-muted-foreground/20 bg-background px-4 mx-auto w-fit rounded-full">
                  New to platform?
               </div>
            </div>

            <p className="text-center font-medium text-muted-foreground/40 text-sm">
              <Link href="/seller/register" className="text-saffron-primary font-black hover:underline group inline-flex items-center gap-2">
                Create Your Account <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </form>
        </GlassCard>

        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           transition={{ delay: 0.5 }}
           className="mt-12 flex items-center justify-center gap-6"
        >
           <div className="flex items-center gap-2 opacity-30">
              <Zap className="w-4 h-4 text-slate-gray" />
              <span className="text-[10px] font-black tracking-widest uppercase">Safe</span>
           </div>
           <div className="flex items-center gap-2 opacity-30">
              <Lock className="w-4 h-4 text-slate-gray" />
              <span className="text-[10px] font-black tracking-widest uppercase">Secure</span>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
