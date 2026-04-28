import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { Provider, Booking, Package } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, IndianRupee, Clock, Briefcase, 
  Settings, CheckCircle2, AlertCircle, Plus, 
  Trash2, Save, Calendar, Star, Info, ShieldCheck
} from 'lucide-react';

export default function ProviderDashboard() {
  const [user] = useAuthState(auth);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<NonNullable<Provider['operatingHours']>>({
    'Monday': { open: '09:00', close: '18:00', active: true },
    'Tuesday': { open: '09:00', close: '18:00', active: true },
    'Wednesday': { open: '09:00', close: '18:00', active: true },
    'Thursday': { open: '09:00', close: '18:00', active: true },
    'Friday': { open: '09:00', close: '18:00', active: true },
    'Saturday': { open: '10:00', close: '16:00', active: false },
    'Sunday': { open: '10:00', close: '16:00', active: false },
  });
  
  useEffect(() => {
    if (!user) return;

    // Fetch User Profile to get providerId
    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.providerId) {
            // Listen to provider data
            const unsubProv = onSnapshot(doc(db, 'providers', userData.providerId), (snap) => {
              if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() } as Provider;
                setProvider(data);
                setBio(data.bio || '');
                setPrice(data.price || 0);
                setIsAvailable(data.isAvailable ?? true);
                setPackages(data.packages || []);
                if (data.operatingHours) setOperatingHours(data.operatingHours);
                if (data.qualifications) setQualifications(data.qualifications);
              }
              setLoading(false);
            });

            // Listen to bookings
            const q = query(collection(db, 'bookings'), where('providerId', '==', userData.providerId));
            const unsubBookings = onSnapshot(q, (snap) => {
              setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
            });

            return () => {
              unsubProv();
              unsubBookings();
            };
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'provider-init');
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!provider) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'providers', provider.id), {
        bio,
        price,
        isAvailable,
        packages,
        operatingHours,
        qualifications,
        updatedAt: new Date().toISOString()
      });
      alert("Profile updated successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `providers/${provider.id}`);
    } finally {
      setSaving(false);
    }
  };

  const addPackage = () => {
    const newPkg: Package = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Package',
      price: 0,
      description: 'Describe what is included...',
      duration: '1 hr',
      includes: ['Basic service']
    };
    setPackages([...packages, newPkg]);
  };

  const updatePackage = (id: string, field: keyof Package, value: any) => {
    setPackages(packages.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  const toggleDay = (day: string) => {
    setOperatingHours({
      ...operatingHours,
      [day]: { ...operatingHours[day], active: !operatingHours[day].active }
    });
  };

  const updateTime = (day: string, type: 'open' | 'close', value: string) => {
    setOperatingHours({
      ...operatingHours,
      [day]: { ...operatingHours[day], [type]: value }
    });
  };

  const addQualification = () => {
    setQualifications([...qualifications, 'New Qualification']);
  };

  const updateQualification = (index: number, value: string) => {
    const next = [...qualifications];
    next[index] = value;
    setQualifications(next);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-gray-900 mb-4">No Partner Profile Found</h2>
        <p className="text-gray-500 font-bold mb-8 italic">Your application might still be pending approval.</p>
        <button onClick={() => window.location.href = '/'} className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img src={provider.imageUrl} className="w-20 h-20 rounded-3xl object-cover shadow-2xl" alt="" />
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Pro Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{provider.specialty}</span>
               <div className="flex items-center text-orange-500 gap-1 font-black text-xs">
                  <Star className="w-4 h-4 fill-current" /> {provider.rating} ({provider.reviewCount})
               </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Syncing...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Profile Core */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <Settings className="text-gray-100 w-24 h-24" />
             </div>
             <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <User className="text-indigo-600" /> Identity & Bio
             </h3>
             <div className="space-y-6 relative">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Professional Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border-none rounded-3xl p-6 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Tell customers why they should hire you..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Base Price (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-black outline-none"
                        />
                      </div>
                   </div>
                   <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         <Clock className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                         <div className="text-[10px] font-black text-gray-400 uppercase">Availability</div>
                         <div className="text-sm font-black">{isAvailable ? 'Taking Bookings' : 'Offline'}</div>
                      </div>
                      <button 
                         onClick={() => setIsAvailable(!isAvailable)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            isAvailable ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                         }`}
                      >
                         {isAvailable ? 'Go Offline' : 'Go Online'}
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Operating Hours (Timings) */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Calendar className="text-indigo-600" /> Operating Hours
             </h3>
             <div className="space-y-4">
                {(Object.entries(operatingHours) as [string, { open: string; close: string; active: boolean }][]).map(([day, config]) => (
                   <div key={day} className="flex flex-wrap items-center justify-between p-6 bg-gray-50/50 rounded-3xl gap-4 border border-gray-50">
                      <div className="flex items-center gap-4 min-w-[120px]">
                         <button 
                            onClick={() => toggleDay(day)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                               config.active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}
                         >
                            {config.active ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                         </button>
                         <span className={`text-sm font-black ${config.active ? 'text-gray-900' : 'text-gray-300'}`}>{day}</span>
                      </div>
                      
                      {config.active && (
                        <div className="flex items-center gap-3">
                           <input 
                              type="time" 
                              value={config.open}
                              onChange={(e) => updateTime(day, 'open', e.target.value)}
                              className="bg-white border-none rounded-xl px-4 py-2 text-xs font-black outline-none shadow-sm"
                           />
                           <span className="text-[10px] font-black text-gray-300">TO</span>
                           <input 
                              type="time" 
                              value={config.close}
                              onChange={(e) => updateTime(day, 'close', e.target.value)}
                              className="bg-white border-none rounded-xl px-4 py-2 text-xs font-black outline-none shadow-sm"
                           />
                        </div>
                      )}
                      
                      {!config.active && (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Marked as Closed</span>
                      )}
                   </div>
                ))}
             </div>
          </div>

          {/* Service Packages */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                   <Briefcase className="text-indigo-600" /> Service Tiers
                </h3>
                <button 
                   onClick={addPackage}
                   className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100"
                >
                   <Plus className="w-5 h-5" />
                </button>
             </div>

             <div className="space-y-6">
                <AnimatePresence>
                   {packages.map((pkg) => (
                      <motion.div 
                        key={pkg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 group relative"
                      >
                         <button 
                            onClick={() => removePackage(pkg.id)}
                            className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <input 
                                 type="text" 
                                 value={pkg.name}
                                 onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)}
                                 className="text-lg font-black bg-transparent border-none p-0 outline-none w-full placeholder:text-gray-300"
                                 placeholder="Package Name"
                               />
                               <textarea 
                                 value={pkg.description}
                                 onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                                 className="text-xs font-medium text-gray-400 bg-transparent border-none p-0 outline-none w-full resize-none h-12"
                                 placeholder="Short description..."
                               />
                            </div>
                            <div className="space-y-4">
                               <div className="flex gap-4">
                                  <div className="flex-1">
                                     <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Price</label>
                                     <input 
                                       type="number"
                                       value={pkg.price}
                                       onChange={(e) => updatePackage(pkg.id, 'price', Number(e.target.value))}
                                       className="w-full bg-white px-4 py-2 rounded-xl text-sm font-black border-none outline-none"
                                     />
                                  </div>
                                  <div className="flex-1">
                                     <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Time</label>
                                     <input 
                                       type="text"
                                       value={pkg.duration}
                                       onChange={(e) => updatePackage(pkg.id, 'duration', e.target.value)}
                                       className="w-full bg-white px-4 py-2 rounded-xl text-sm font-black border-none outline-none"
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </AnimatePresence>
                {packages.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                     <Info className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                     <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No active tiers. Create one to attract high-value leads.</p>
                  </div>
                )}
             </div>
          </div>

          {/* Qualifications (Qualities) */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                   <ShieldCheck className="text-indigo-600" /> Professional Qualities
                </h3>
                <button 
                   onClick={addQualification}
                   className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-100"
                >
                   <Plus className="w-5 h-5" />
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qualifications.map((q, idx) => (
                   <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl group border border-gray-50">
                      <input 
                         type="text" 
                         value={q}
                         onChange={(e) => updateQualification(idx, e.target.value)}
                         className="flex-1 bg-transparent border-none text-sm font-bold text-gray-700 outline-none"
                         placeholder="e.g. Certified Electrician"
                      />
                      <button 
                         onClick={() => removeQualification(idx)}
                         className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))}
                {qualifications.length === 0 && (
                   <div className="col-span-full py-8 text-center bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Describe your expertise or special skills</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Quick Stats */}
          <div className="bg-black text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
             <TrendingUp className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
             <h3 className="text-xl font-black mb-8">Performance</h3>
             <div className="space-y-8 relative">
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase mb-1">Success Units</div>
                   <div className="text-4xl font-black">{provider.jobsCompleted || 0}</div>
                   <div className="text-[10px] font-black text-emerald-400 mt-2">Verified completion</div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                   <div>
                      <div className="text-[10px] font-black text-white/40 uppercase mb-1">Pending</div>
                      <div className="text-xl font-black">{bookings.filter(b => b.status === 'pending').length}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-white/40 uppercase mb-1">New Reviews</div>
                      <div className="text-xl font-black">0</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Bookings Shortlist */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm h-fit">
             <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Calendar className="text-indigo-600" /> Active Schedule
             </h3>
             <div className="space-y-4">
                {bookings.filter(b => b.status === 'pending').slice(0, 5).map((booking) => (
                   <div key={booking.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-black text-gray-900 text-sm">{booking.userName}</div>
                         <div className="text-[10px] font-black text-indigo-600">{booking.price}</div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase">
                         <MapPin className="w-3 h-3" /> Area client
                         <Clock className="w-3 h-3 ml-2" /> {booking.serviceTime}
                      </div>
                   </div>
                ))}
                {bookings.filter(b => b.status === 'pending').length === 0 && (
                   <div className="text-center py-10">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active bookings</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
