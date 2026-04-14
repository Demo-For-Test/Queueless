"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, Trash2, Edit2, X, ChefHat, ShoppingBag, LayoutDashboard, Menu as MenuIcon, Monitor, LogOut, ImagePlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function MenuManager() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [shopId, setShopId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Convert image to base64 using FileReader — no server upload needed
  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, image: base64 }));
      setImagePreview(base64);
      setImageUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image');
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem('sellerData');
    if (data) {
      const seller = JSON.parse(data);
      setShopId(seller._id);
      fetchItems(seller._id);
    }
  }, []);

  const fetchItems = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/menu/${id}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category.trim()) {
      alert("Name, Price, and Category are required!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        image: formData.image,
        isAvailable: formData.isAvailable,
        sellerId: shopId
      };

      if (editingItem) {
        await axios.put(`${API_URL}/menu/${editingItem._id}`, payload);
      } else {
        await axios.post(`${API_URL}/menu`, payload);
      }
      await fetchItems(shopId);
      closeModal();
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item?')) {
      try {
        await axios.delete(`${API_URL}/menu/${id}`);
        fetchItems(shopId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image: item.image || '',
        isAvailable: item.isAvailable
      });
      setImagePreview(item.image || null);
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category: '', image: '', isAvailable: true });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImagePreview(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, [processImage]);

  const NavLink = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={() => { onClick?.(); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group ${
        active
          ? 'bg-saffron-50 text-saffron-primary ring-1 ring-saffron-primary/10'
          : 'text-slate-gray/60 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-saffron-primary' : 'text-slate-gray/30 group-hover:text-saffron-primary'}`} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
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
            <button onClick={() => router.push('/seller/dashboard')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-black text-xs uppercase tracking-widest">
              <LayoutDashboard className="w-5 h-5 text-muted-foreground/30" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-saffron-primary/10 text-saffron-primary font-black text-xs uppercase tracking-widest ring-1 ring-saffron-primary/10 shadow-sm">
              <MenuIcon className="w-5 h-5 text-saffron-primary" /> Menu Manager
            </button>
            <button onClick={() => router.push('/seller/display')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-black text-xs uppercase tracking-widest">
              <Monitor className="w-5 h-5 text-muted-foreground/30" /> Live Screen
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <button onClick={() => { localStorage.clear(); router.push('/seller/login'); }} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/5 transition-all group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-12 space-y-8 min-w-0">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Menu <span className="text-gradient">Manager</span></h2>
              <p className="text-muted-foreground font-medium text-sm mt-1">Design your digital stall layout</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={() => openModal()} className="h-14 px-8 rounded-2xl shadow-saffron-500/20 text-xs font-black uppercase tracking-widest">
                <Plus className="w-5 h-5 mr-1" /> Add New Dish
              </Button>
            </div>
          </header>

          {/* Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <GlassCard hover={false} className="p-0 border-slate-100 flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group bg-white rounded-3xl">
                    <div className="relative h-36 md:h-48 bg-slate-50 overflow-hidden rounded-t-3xl">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={item.name}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg ${item.isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm md:text-base font-black text-slate-900 leading-tight">{item.name}</h3>
                      <p className="text-[11px] text-slate-gray/50 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-baseline gap-1 mt-3 text-saffron-primary">
                        <span className="text-xs font-black">₹</span>
                        <span className="text-lg font-black">{item.price}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="flex-1 h-9 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-gray hover:bg-saffron-50 hover:border-saffron-primary/20 hover:text-saffron-primary transition-all"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex-1 h-9 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {items.length === 0 && (
            <div className="text-center py-24 text-slate-gray/30">
              <ChefHat className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="font-black uppercase tracking-widest text-sm">No items yet</p>
              <p className="text-xs mt-2 font-medium">Tap &quot;Add Item&quot; to get started</p>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full sm:max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Sticky Modal Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex justify-between items-center px-8 pt-8 pb-5 border-b border-slate-100 rounded-t-[40px] z-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 italic">{editingItem ? 'Edit Item' : 'New Item'}</h2>
                    <p className="text-[10px] font-black text-slate-gray/40 uppercase tracking-[0.2em] mt-0.5">Stall Management</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-slate-gray" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                  <Input label="Item Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Maharaja Thali" />
                  <Input label="Description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your dish..." />

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Price (₹)" type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    <Input label="Category" placeholder="e.g. Street Food" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                  </div>

                  {/* Image Picker */}
                  <div>
                    <p className="text-[10px] font-black text-slate-gray/50 uppercase tracking-[0.2em] mb-2.5">Item Photo</p>

                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-100 group">
                        <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center gap-3">
                          <label htmlFor="item-img-upload" className="opacity-0 group-hover:opacity-100 transition-all p-3 bg-white text-saffron-primary rounded-2xl shadow-lg cursor-pointer hover:bg-saffron-50">
                            <ImagePlus className="w-5 h-5" />
                          </label>
                          <button
                            type="button"
                            onClick={() => { setImagePreview(null); setFormData(prev => ({...prev, image: ''})); }}
                            className="opacity-0 group-hover:opacity-100 transition-all p-3 bg-red-500 text-white rounded-2xl shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <input id="item-img-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImage(f); e.target.value = ''; }} />
                      </div>
                    ) : (
                      <label
                        htmlFor="item-img-upload"
                        className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                          imageUploading ? 'border-saffron-primary/40 bg-saffron-50 pointer-events-none' : 'border-slate-200 hover:border-saffron-primary/50 hover:bg-orange-50/50'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        {imageUploading ? (
                          <>
                            <Loader2 className="w-7 h-7 text-saffron-primary animate-spin mb-2" />
                            <p className="text-xs font-black text-saffron-primary uppercase tracking-widest">Processing...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-saffron-primary/10 rounded-2xl flex items-center justify-center mb-2.5">
                              <ImagePlus className="w-6 h-6 text-saffron-primary" />
                            </div>
                            <p className="text-sm font-black text-slate-900">Tap to choose a photo</p>
                            <p className="text-[10px] font-bold text-slate-gray/40 mt-1 uppercase tracking-widest">JPG · PNG · WEBP · Max 5MB</p>
                          </>
                        )}
                        <input id="item-img-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processImage(f); e.target.value = ''; }} />
                      </label>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100 select-none hover:bg-white transition-all">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-colors duration-200" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
                    </div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Available for Order</span>
                  </label>

                  <Button type="submit" className="w-full h-14 rounded-2xl text-sm font-black" disabled={loading}>
                    {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add to Menu')}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
