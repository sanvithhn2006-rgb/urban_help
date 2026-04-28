import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Star, ShieldCheck, Zap, Droplets, Sparkles, GraduationCap, Paintbrush, Scissors, Hammer, ArrowRight, CheckCircle2, ChevronRight, Clock, StarHalf } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Category, Provider } from '../types';

export default function Home() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const catsSnap = await getDocs(collection(db, 'categories'));
      setCategories(catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      
      const provsQuery = query(collection(db, 'providers'), limit(4));
      const provsSnap = await getDocs(provsQuery);
      setFeaturedProviders(provsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/services?q=${encodeURIComponent(search)}`);
    }
  };

  const mainCategories = [
    { id: 'cleaning', name: 'Home Cleaning', icon: <Sparkles className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'electrician', name: 'Electricians', icon: <Zap className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600' },
    { id: 'plumbing', name: 'Plumbers', icon: <Droplets className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600' },
    { id: 'tutor', name: 'Tutors', icon: <GraduationCap className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'salon', name: 'Salon at Home', icon: <Scissors className="w-8 h-8" />, color: 'bg-pink-50 text-pink-600' },
    { id: 'painting', name: 'Home Painting', icon: <Paintbrush className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600' },
    { id: 'carpenter', name: 'Carpenters', icon: <Hammer className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1582653291997-079a1df82a56?q=80&w=2670&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-5" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FDFDFD]/50 to-[#FDFDFD]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-8"
          >
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Bangalore, Karnataka</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.9] mb-8"
          >
            Home services,<br /> <span className="text-indigo-600 italic">simplified.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 font-medium mb-12 max-w-xl mx-auto"
          >
            Book verified professionals for everything from deep cleaning to complex repairs in minutes.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute inset-0 bg-indigo-600/10 blur-2xl rounded-full scale-95 group-focus-within:scale-100 transition-transform" />
            <div className="relative flex bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
               <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                  <input 
                    type="text" 
                    placeholder="Search for 'AC Repair', 'Deep Cleaning'..." 
                    className="w-full pl-16 pr-4 py-6 bg-transparent outline-none text-xl font-bold placeholder:text-gray-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <button type="submit" className="bg-black text-white px-10 rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-colors">
                  Find Help
               </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-gray-100">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
              {mainCategories.map((cat, i) => (
                <Link 
                  key={cat.id} 
                  to={`/services?category=${cat.id}`}
                  className="flex flex-col items-center group"
                >
                   <motion.div 
                     whileHover={{ y: -8, scale: 1.05 }}
                     className={`w-20 h-20 ${cat.color} rounded-3xl flex items-center justify-center mb-4 transition-all shadow-lg shadow-black/5 group-hover:shadow-indigo-500/20`}
                   >
                      {cat.icon}
                   </motion.div>
                   <span className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-center">{cat.name}</span>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* New & Noteworthy - The 'Package' section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">New & Noteworthy</h2>
            <p className="text-gray-500 font-medium text-lg">Curated packages for the Bangalore lifestyle.</p>
          </div>
          <Link to="/services" className="px-8 py-3 bg-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-all">
            View All Services <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { title: 'Full Home Spa', price: '₹2,499', img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800', badge: 'Save 20%' },
             { title: 'AC Master Service', price: '₹499', img: 'https://images.unsplash.com/photo-1635350736475-c8cef4b21906?q=80&w=800', badge: 'Popular' },
             { title: 'Kitchen Deep Clean', price: '₹999', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800', badge: 'Bestseller' }
           ].map((pkg, i) => (
             <motion.div 
               whileHover={{ y: -12 }}
               key={i} 
               onClick={() => navigate('/services')}
               className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer"
             >
                <img src={pkg.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-8 left-8 py-2 px-4 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                   {pkg.badge}
                </div>
                <div className="absolute bottom-10 left-10 right-10 text-white">
                   <h3 className="text-3xl font-black mb-2">{pkg.title}</h3>
                   <div className="flex justify-between items-center">
                      <div className="text-xl font-medium opacity-80">Starts at {pkg.price}</div>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg">
                         <ArrowRight className="w-6 h-6" />
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="bg-black py-40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-12">
                   Your safety is our <span className="text-indigo-500">priority.</span>
                </h2>
                <div className="space-y-10">
                   {[
                     { title: 'Background Verified', icon: <ShieldCheck />, desc: 'Every professional undergoes a rigorous background check.' } as const,
                     { title: 'Quality Guaranteed', icon: <CheckCircle2 />, desc: 'If you aren\'t satisfied, we\'ll fix it for free. No questions asked.' } as const,
                     { title: 'Instant Support', icon: <Clock />, desc: '24/7 localized support for all your booking queries.' } as const
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                           {item.icon}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-white mb-2">{item.title}</h4>
                           <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/20 blur-3xl rounded-[4rem]" />
                <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
                   <img src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1000" className="w-full h-full object-cover" alt="Service expert" />
                   <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="flex text-orange-400">
                            {[1,2,3,4].map(i => <Star key={i} className="w-5 h-5 fill-orange-400" />)}
                            <StarHalf className="w-5 h-5 fill-orange-400" />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest text-gray-400">4.8 Average Rating</span>
                      </div>
                      <p className="text-gray-900 font-black text-xl italic tracking-tight">"Absolutely professional. Fixed our AC in 20 minutes. Highly recommend UrbanHelp!"</p>
                      <p className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600">Ravindra Sharma, Indiranagar</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="max-w-7xl mx-auto px-4 py-40">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Highly Rated Pros</h2>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">The most requested experts in your neighborhood, backed by thousands of 5-star reviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {featuredProviders.map((provider) => (
             <Link to="/services" key={provider.id} className="group cursor-pointer">
                <div className="relative rounded-[2.5rem] overflow-hidden mb-6 aspect-[4/5] shadow-xl">
                   <img src={provider.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute bottom-8 left-8 right-8 text-white translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="text-2xl font-black">{provider.name}</div>
                      <div className="text-sm font-medium opacity-80">{provider.specialty}</div>
                   </div>
                </div>
                <div className="flex justify-between items-center px-4">
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{provider.specialty}</div>
                      <div className="flex items-center gap-1.5">
                         <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                         <span className="text-sm font-black text-gray-900">{provider.rating}</span>
                      </div>
                   </div>
                   <div className="text-lg font-black text-indigo-600">₹{provider.price}<span className="text-xs font-normal text-gray-300">/hr</span></div>
                </div>
             </Link>
           ))}
        </div>
      </section>
    </div>
  );
}

