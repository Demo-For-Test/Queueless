"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, Phone, Mail, MapPin, Zap, ChevronRight, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

/* Page Name: SellerRegistration */

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    category: '',
    location: '',
    upiId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      setSuccess(true);
      setTimeout(() => router.push('/seller/login'), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-saffron-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header with Back button and Theme Toggle */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <Link href="/" className="p-3 glass rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
         {/* Branding Side */}
         <div className="hidden lg:flex flex-col space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -30 }} 
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-saffron-primary/10 text-saffron-primary font-black text-xs uppercase tracking-widest"
            >
               <Zap className="w-4 h-4 fill-current" /> Join the Digital Revolution
            </motion.div>
            <motion.h1 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.1 }}
               className="text-7xl font-black text-foreground leading-tight"
            >
               Take your <br />
               <span className="text-gradient">Stall Digital.</span>
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.2 }}
               className="text-xl text-muted-foreground/60 leading-relaxed max-w-md font-medium"
            >
               Empower your shop with QueueLess. Handle menus, tokens, and payments in one beautiful dashboard.
            </motion.p>
            
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               transition={{ delay: 0.3 }}
               className="flex gap-4"
            >
               <div className="p-5 glass rounded-[32px] border-border shadow-xl">
                  <p className="text-4xl font-black text-foreground italic">3 Days</p>
                  <p className="text-[10px] font-black text-saffron-primary uppercase tracking-widest mt-1">Free Trial Access</p>
               </div>
               <div className="p-5 glass rounded-[32px] border-border shadow-xl">
                  <p className="text-4xl font-black text-foreground italic">No</p>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Setup Fee Required</p>
               </div>
            </motion.div>
         </div>

         {/* Form Side */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }}
           className="w-full"
         >
            <GlassCard className="p-8 md:p-14 border-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[48px] ring-1 ring-border bg-card">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-10 text-center lg:text-left">
                       <h2 className="text-4xl font-black text-foreground italic leading-none">Create Account</h2>
                       <p className="text-muted-foreground/40 mt-2 font-black uppercase tracking-widest text-[10px]">Merchant Registration</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Shop Name" placeholder="e.g. Tasty Tacos" value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} required />
                        <Input label="Owner Name" placeholder="Your Name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Phone Number" placeholder="10-digit number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                        <Input label="Email Address" type="email" placeholder="owner@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Access Password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        <Input label="Stall Location" placeholder="e.g. Stall 42, Hall A" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                      </div>

                       <div className="space-y-1">
                        <Input label="Payment UPI ID (Optional)" placeholder="yourname@upi" value={formData.upiId} onChange={(e) => setFormData({...formData, upiId: e.target.value})} />
                        <p className="text-[9px] text-muted-foreground/30 font-medium ml-1 italic">* Used for online payment receiving</p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-16 rounded-[28px] text-sm font-black uppercase tracking-widest shadow-xl shadow-saffron-500/20"
                      >
                        {loading ? 'Creating Account...' : 'Create My Stall'} <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>

                      <p className="text-center font-medium text-muted-foreground/40 text-sm">
                        Already registered? <Link href="/seller/login" className="text-saffron-primary font-black hover:underline ml-1">Log in</Link>
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                       <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground italic">Welcome Aboard!</h2>
                    <p className="text-muted-foreground/50 mt-4 font-medium leading-relaxed">
                      Your stall is now digital. <br />
                      Redirecting you to the portal...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
         </motion.div>
      </div>
    </div>
  );
}
