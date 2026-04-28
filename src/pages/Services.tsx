import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Provider, Category, Package } from '../types';
import { Search, Star, Calendar, X, CheckCircle2, IndianRupee, MapPin, Phone, ArrowRight, ChevronRight, Clock, Plus, Minus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';

export default function Services() {
  const [searchParams] = useSearchParams();
  const [user] = useAuthState(auth);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  
  // Advanced Selection State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [cart, setCart] = useState<Package[]>([]);
  const [bookingStep, setBookingStep] = useState<'cart' | 'slots' | 'details'>('cart');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingFormData, setBookingFormData] = useState({ phone: '', notes: '' });
  
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catsSnap = await getDocs(collection(db, 'categories'));
        setCategories(catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

        const provsSnap = await getDocs(collection(db, 'providers'));
        setProviders(provsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
        
        const providerId = searchParams.get('provider');
        if (providerId) {
          const prov = provsSnap.docs.find(d => d.id === providerId);
          if (prov) handleOpenDrawer(prov.data() as Provider);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'providers/categories');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [providers, search, selectedCategory]);

  const handleOpenDrawer = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDrawerOpen(true);
    setBookingStep('cart');
    setCart([]);
  };

  const togglePackage = (pkg: Package) => {
    setCart(prev => prev.find(p => p.id === pkg.id) ? prev.filter(p => p.id !== pkg.id) : [...prev, pkg]);
  };

  const totalAmount = cart.reduce((sum, p) => sum + p.price, 0);

  const handleFinalConfirm = async () => {
    if (!selectedProvider || !user || cart.length === 0) return;
    
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: user.displayName,
        userPhone: bookingFormData.phone,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        specialty: selectedProvider.specialty,
        price: totalAmount,
        serviceDate: selectedDate.toISOString(),
        serviceTime: selectedTime,
        status: 'pending',
        items: cart.map(p => p.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: bookingFormData.notes
      });
      
      setBookingSuccess(true);
      setIsDrawerOpen(false);
      setTimeout(() => setBookingSuccess(false), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'bookings');
    }
  };

  const timeSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM", "07:00 PM"];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Category Horizontal Switcher */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 mb-8">
         <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === 'all' ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              All Services
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        {/* Search & Subtitle */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
                {selectedCategory === 'all' ? 'All Experts' : categories.find(c => c.id === selectedCategory)?.name}
              </h1>
              <p className="text-gray-500 font-medium">Browse verified professionals and choose specifically what you need.</p>
           </div>
           <div className="relative w-full md:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProviders.map((provider) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={provider.id}
                  onClick={() => handleOpenDrawer(provider)}
                  className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-8">
                     <img src={provider.imageUrl} className="w-20 h-20 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-xl shadow-black/5" alt="" />
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-orange-600" /> {provider.rating}
                     </div>
                  </div>

                  <div className="mb-8">
                     <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{provider.specialty}</div>
                     <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">{provider.name}</h3>
                     <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5" /> {provider.location}
                     </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8 py-6 border-y border-gray-50">
                     <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jobs</div>
                        <div className="text-lg font-black">{provider.jobsCompleted}+</div>
                     </div>
                     <div className="w-px h-8 bg-gray-100" />
                     <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee</div>
                        <div className="text-lg font-black flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{provider.price}</div>
                     </div>
                  </div>

                  <button className="w-full bg-gray-50 group-hover:bg-black group-hover:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                     Select Specialist <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Booking Drawer/Sheet */}
      <AnimatePresence>
         {isDrawerOpen && selectedProvider && (
           <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[3rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
              >
                  {/* Drawer Header */}
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <div className="flex gap-4 items-center">
                        <img src={selectedProvider.imageUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                        <div>
                           <h3 className="text-xl font-black text-gray-900">{selectedProvider.name}</h3>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{selectedProvider.specialty}</p>
                        </div>
                     </div>
                     <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Drawer Progress */}
                  <div className="flex h-1.5 w-full bg-gray-100">
                     <div className={`h-full bg-indigo-600 transition-all duration-500 ${
                       bookingStep === 'cart' ? 'w-1/3' : bookingStep === 'slots' ? 'w-2/3' : 'w-full'
                     }`} />
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                     {bookingStep === 'cart' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                           <div className="flex justify-between items-center">
                              <h4 className="text-2xl font-black tracking-tighter">Choose Services</h4>
                              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Select one or more</div>
                           </div>
                           
                           <div className="space-y-4">
                              {(selectedProvider.packages || [
                                { id: 'p1', name: 'Standard Service', price: selectedProvider.price, duration: '45 mins', description: 'Complete general inspection and service.', includes: ['Cleaning', 'Testing'] },
                                { id: 'p2', name: 'Premium Upgrade', price: selectedProvider.price + 500, duration: '90 mins', description: 'Deep service with replacement of minor parts.', includes: ['Deep Cleaning', 'Parts Refill'] }
                              ]).map((pkg) => {
                                const isInCart = cart.find(p => p.id === pkg.id);
                                return (
                                  <div key={pkg.id} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between gap-6 ${
                                    isInCart ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 hover:border-indigo-100'
                                  }`} onClick={() => togglePackage(pkg)}>
                                     <div className="flex-1">
                                        <h5 className="text-xl font-black mb-1">{pkg.name}</h5>
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pkg.duration}</span>
                                           <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Details</span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{pkg.description}</p>
                                        <div className="text-2xl font-black flex items-center text-gray-900 transition-colors">
                                           <IndianRupee className="w-4 h-4" />{pkg.price}
                                        </div>
                                     </div>
                                     <div className="shrink-0 flex items-center">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                          isInCart ? 'bg-indigo-600 text-white rotate-90' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                           {isInCart ? <Plus className="rotate-45" /> : <Plus />}
                                        </div>
                                     </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     )}

                     {bookingStep === 'slots' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="text-2xl font-black tracking-tighter">Schedule Service</h4>
                            
                            <div className="space-y-6">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Day</label>
                               <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                  {[0,1,2,3,4,5,6].map(i => {
                                    const date = addDays(new Date(), i);
                                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                                    return (
                                      <button 
                                        key={i} 
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl border-2 transition-all ${
                                          isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50'
                                        }`}
                                      >
                                        <span className="text-[10px] font-black uppercase mb-1">{format(date, 'eee')}</span>
                                        <span className="text-xl font-black">{format(date, 'dd')}</span>
                                      </button>
                                    );
                                  })}
                               </div>

                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pt-4">Available Slots</label>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {timeSlots.map(time => (
                                    <button 
                                      key={time}
                                      onClick={() => setSelectedTime(time)}
                                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                        selectedTime === time ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 hover:bg-gray-50'
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  ))}
                               </div>
                            </div>
                        </div>
                     )}

                     {bookingStep === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="text-2xl font-black tracking-tighter">Confirm Details</h4>
                            
                            <div className="space-y-6">
                               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                  <div className="flex justify-between mb-4">
                                     <span className="text-xs font-bold text-gray-400 uppercase">Appointment</span>
                                     <span className="text-sm font-black">{format(selectedDate, 'MMMM dd')} at {selectedTime}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-xs font-bold text-gray-400 uppercase">Items Selected</span>
                                     <span className="text-sm font-black text-right">{cart.length} Packages</span>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <div className="relative">
                                     <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                     <input 
                                       type="text" 
                                       placeholder="Confirm contact number" 
                                       className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold"
                                       value={bookingFormData.phone}
                                       onChange={(e) => setBookingFormData({...bookingFormData, phone: e.target.value})}
                                     />
                                  </div>
                                  <textarea 
                                    rows={3} 
                                    className="w-full p-6 bg-white border border-gray-100 rounded-2xl outline-none font-bold" 
                                    placeholder="Any specific instructions for the expert?"
                                    value={bookingFormData.notes}
                                    onChange={(e) => setBookingFormData({...bookingFormData, notes: e.target.value})}
                                  />
                               </div>
                            </div>
                        </div>
                     )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-8 border-t border-gray-100 bg-white">
                     <div className="flex items-center justify-between gap-8">
                        <div>
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</div>
                           <div className="text-3xl font-black flex items-center gap-0.5"><IndianRupee className="w-5 h-5" />{totalAmount}</div>
                        </div>
                        
                        {bookingStep === 'cart' && (
                           <button 
                             disabled={cart.length === 0}
                             onClick={() => setBookingStep('slots')}
                             className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-600 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                           >
                              Pick Timing <ArrowRight className="w-5 h-5" />
                           </button>
                        )}

                        {bookingStep === 'slots' && (
                           <div className="flex-1 flex gap-3">
                              <button onClick={() => setBookingStep('cart')} className="px-6 py-5 rounded-2xl border-2 border-gray-50 font-black text-gray-400">Back</button>
                              <button 
                                disabled={!selectedTime}
                                onClick={() => setBookingStep('details')}
                                className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                              >
                                 Continue <ArrowRight className="w-5 h-5" />
                              </button>
                           </div>
                        )}

                        {bookingStep === 'details' && (
                           <div className="flex-1 flex gap-3">
                              <button onClick={() => setBookingStep('slots')} className="px-6 py-5 rounded-2xl border-2 border-gray-50 font-black text-gray-400">Back</button>
                              <button 
                                onClick={handleFinalConfirm}
                                className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                              >
                                 Confirm <CheckCircle2 className="w-5 h-5" />
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Booking Success Toast */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
          >
             <div className="bg-black text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-6 border border-white/10">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
                   <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                   <h3 className="font-black text-lg">Booking Confirmed</h3>
                   <p className="text-gray-400 text-xs font-bold leading-relaxed">Expert will call you in 15 mins to confirm details.</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

