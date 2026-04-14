"use client";
/* Page Name: SellerDashboard */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  LogOut, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Bell,
  Monitor,
  QrCode,
  MapPin,
  X,
  User,
  Phone,
  Lock,
  ChefHat,
  ChevronRight,
  Star,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL, SOCKET_URL } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrderQueue } from '@/components/dashboard/OrderQueue';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pending: 0,
    ready: 0,
    revenue: 0
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    location: '',
    upiId: ''
  });

  useEffect(() => {
    const data = localStorage.getItem('sellerData');
    if (!data) return router.push('/seller/login');
    const sellerData = JSON.parse(data);
    setSeller(sellerData);
    setProfileData({
      shopName: sellerData.shopName,
      ownerName: sellerData.ownerName,
      phone: sellerData.phone,
      location: sellerData.location,
      upiId: sellerData.upiId || ''
    });

    const fetchDashboardData = async () => {
      try {
        const [ordersRes, sellerRes] = await Promise.all([
          axios.get(`${API_URL}/order/seller/${sellerData._id}`),
          axios.get(`${API_URL}/auth/shop/${sellerData._id}`)
        ]);
        setOrders(ordersRes.data);
        setSeller(sellerRes.data);
        localStorage.setItem('sellerData', JSON.stringify(sellerRes.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();

    const socket = io(SOCKET_URL);
    socket.emit('join-shop', sellerData._id);

    socket.on('new-order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      // Play sound notification
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log("Sound play error:", e));
    });

    socket.on('order-status-updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => { socket.disconnect(); };
  }, [router]);

  useEffect(() => {
    const today = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    setStats({
      todayOrders: today.length,
      pending: today.filter(o => o.status === 'Pending' || o.status === 'Preparing').length,
      ready: today.filter(o => o.status === 'Ready').length,
      revenue: today.reduce((acc, o) => acc + o.totalAmount, 0)
    });
  }, [orders]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API_URL}/order/${id}/status`, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderPayment = async (id: string, paymentStatus: string) => {
    try {
      await axios.patch(`${API_URL}/order/${id}/payment`, { paymentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${API_URL}/auth/shop/${seller._id}`, profileData);
      setSeller(res.data);
      localStorage.setItem('sellerData', JSON.stringify(res.data));
      setIsProfileModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (!seller) return null;

  const shopUrl = typeof window !== 'undefined' ? `${window.location.origin}/shop/${seller._id}` : '';

  const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest group",
        active 
          ? "bg-saffron-primary/10 text-saffron-primary ring-1 ring-saffron-primary/10 shadow-sm" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-saffron-primary" : "text-slate-gray/30 group-hover:text-saffron-primary")} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      {/* Subscription Expiry Overlay */}
      <AnimatePresence>
        {seller.subscriptionStatus === 'Expired' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <GlassCard className="max-w-md w-full p-10 bg-white shadow-2xl rounded-[40px] border-white">
              <div className="w-20 h-20 bg-red-100 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <ShieldCheck className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 italic">Trial Ended</h2>
              <p className="text-slate-gray/50 mt-4 font-medium leading-relaxed">
                Your 3-day free trial has expired. To continue accepting orders, please activate your subscription.
              </p>
              <div className="mt-10 space-y-4">
                <Button className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800">
                  Pay & Activate (₹999/Mo)
                </Button>
                <p className="text-[10px] text-slate-gray/30 font-black uppercase tracking-widest leading-loose">
                  Instant activation • Full features access <br /> Priority support included
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-card border-b border-border px-5 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-saffron-primary rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg italic text-foreground">Queue<span className="text-saffron-primary">Less</span></span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div onClick={() => setIsProfileModalOpen(true)} className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs cursor-pointer">{seller.shopName[0]}</div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-muted">
            <MenuIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border p-7 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-saffron-primary flex items-center justify-center rounded-2xl shadow-xl shadow-saffron-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-foreground italic">Queue<span className="text-saffron-primary">Less</span></h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-muted rounded-xl">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

          <nav className="flex-1 space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={QrCode} label="Store QR" onClick={() => { setIsQrModalOpen(true); setSidebarOpen(false); }} />
            <NavItem icon={MenuIcon} label="Menu List" onClick={() => { router.push('/seller/menu'); setSidebarOpen(false); }} />
            <NavItem icon={Monitor} label="Live Screen" onClick={() => { router.push('/seller/display'); setSidebarOpen(false); }} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              onClick={() => { localStorage.clear(); router.push('/seller/login'); }}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-12 space-y-8 min-w-0">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
                Welcome back, <span className="text-gradient">{seller.shopName}</span>
              </h2>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground font-medium text-sm">
                <MapPin className="w-4 h-4" /> {seller.location}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <div className="relative p-3 glass border-border rounded-2xl cursor-pointer hover:bg-muted transition-all shadow-sm group">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </div>
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-sm uppercase ring-4 ring-white"
              >
                {seller.shopName[0]}
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatCard title="Orders Today" value={stats.todayOrders} icon={ShoppingBag} color="bg-saffron-primary/10 text-saffron-primary" />
            <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-orange-50 text-orange-600" />
            <StatCard title="Ready" value={stats.ready} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
            <StatCard title="Revenue" value={`₹${stats.revenue}`} icon={IndianRupee} color="bg-slate-100 text-slate-900" />
          </div>

          {/* Queue Management */}
          <section className="mt-6">
            <OrderQueue orders={orders.filter(o => o.status !== 'Completed')} onUpdateStatus={updateOrderStatus} onUpdatePayment={updateOrderPayment} />
          </section>

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsProfileModalOpen(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard hover={false} className="bg-white p-6 md:p-12 relative border-white shadow-2xl rounded-[32px] md:rounded-[40px]">
                  <header className="flex justify-between items-center mb-8 md:mb-10">
                    <div>
                       <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight italic">Store Details</h2>
                       <p className="text-[10px] font-black text-slate-gray/40 uppercase tracking-[0.2em] mt-1">Merchant Profile</p>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 md:p-4 hover:bg-slate-100 rounded-xl md:rounded-3xl transition-all">
                      <X className="w-5 h-5 md:w-6 md:h-6 text-slate-gray" />
                    </button>
                  </header>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       <Input label="Shop Name" value={profileData.shopName} onChange={(e) => setProfileData({...profileData, shopName: e.target.value})} required />
                       <Input label="Owner Name" value={profileData.ownerName} onChange={(e) => setProfileData({...profileData, ownerName: e.target.value})} required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       <Input label="Phone Number" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} required />
                       <Input label="UPI ID" value={profileData.upiId} onChange={(e) => setProfileData({...profileData, upiId: e.target.value})} placeholder="yourname@upi" />
                    </div>

                    <Input label="Stall Location" value={profileData.location} onChange={(e) => setProfileData({...profileData, location: e.target.value})} required />

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                       <Button type="submit" className="flex-1 h-14 rounded-2xl text-sm font-black">Update Profile</Button>
                       <Button variant="outline" type="button" onClick={() => setIsProfileModalOpen(false)} className="h-14 sm:px-10 rounded-2xl border-slate-100 font-bold">Cancel</Button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* QR Modal */}
        <AnimatePresence>
          {isQrModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsQrModalOpen(false)}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard hover={false} className="bg-white p-6 md:p-12 text-center relative border-white shadow-2xl rounded-[32px] md:rounded-[40px]">
                  <button 
                    onClick={() => setIsQrModalOpen(false)} 
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-slate-gray" />
                  </button>
                  
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-saffron-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                     <QrCode className="w-8 h-8 md:w-10 md:h-10 text-saffron-primary" />
                  </div>
                  
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight italic truncate px-2">{seller.shopName}</h2>
                  <p className="text-slate-gray/40 mt-1 md:mt-2 font-black uppercase tracking-widest text-[8px] md:text-[10px]">Scan to Order</p>

                  {/* Short Code Badge */}
                  {seller.shortCode && (
                    <div className="mt-4 inline-flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Your Stall Code</span>
                      <span className="text-2xl font-black tracking-widest text-saffron-primary">{seller.shortCode}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-gray/40 font-medium mt-2 uppercase tracking-widest">Customers can enter this at queueless.app</p>
                  
                  <div className="bg-white p-6 rounded-[32px] shadow-inner border border-slate-100 inline-block my-6 relative">
                    <QRCodeSVG value={shopUrl} size={190} level="H" includeMargin={true} />
                  </div>

                  <p className="text-[10px] text-slate-gray/40 font-medium mb-6 bg-slate-50 rounded-2xl p-3 break-all">
                    {shopUrl}
                  </p>

                  <div className="flex flex-col gap-3">
                     <Button onClick={() => window.print()} className="w-full h-14 rounded-2xl font-black text-sm bg-slate-900 hover:bg-slate-800 shadow-xl">
                        🖨️ Print QR Flyer
                     </Button>
                     <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 text-slate-gray font-bold text-xs" onClick={() => setIsQrModalOpen(false)}>
                        Close
                     </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
