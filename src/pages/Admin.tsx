import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Booking, Category, Provider, Application } from '../types';
import { LayoutDashboard, Users, CheckCircle, Clock, Trash2, Search, Filter, ArrowUpRight, IndianRupee, TrendingUp, Calendar, Database, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function Admin() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'apps'>('bookings');
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
      
      const completed = data.filter(b => b.status === 'completed').length;
      const pending = data.filter(b => b.status === 'pending').length;
      const revenue = data.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (curr.price || 0), 0);
      
      setStats({ total: data.length, completed, pending, revenue });
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'bookings');
    });

    const qApps = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubApps = onSnapshot(qApps, (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'applications');
    });

    return () => {
      unsubscribe();
      unsubApps();
    };
  }, []);

  const handleApproveApplication = async (app: Application) => {
    if (!confirm(`Approve ${app.name} as a professional partner?`)) return;
    
    try {
      const providerId = `p_${app.id}`;
      
      // 1. Create Provider Profile
      const providerData: Partial<Provider> = {
        id: providerId,
        userId: app.userId || undefined,
        name: app.name,
        specialty: app.specialty,
        phone: app.phone,
        location: app.city,
        price: 499, // default
        rating: 5.0,
        reviewCount: 0,
        jobsCompleted: 0,
        isAvailable: true,
        bio: `Professional ${app.specialty} with expertise and verified background.`,
        categoryId: app.specialty, // assumes category ID matches specialty key or handles later
        imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop',
      };
      
      await setDoc(doc(db, 'providers', providerId), providerData);
      
      // 2. Update Application Status
      await updateDoc(doc(db, 'applications', app.id), { status: 'accepted' });
      
      // 3. Update User role if userId exists
      if (app.userId) {
        await updateDoc(doc(db, 'users', app.userId), { 
          role: 'provider',
          providerId: providerId
        });
      }
      
      alert(`Successfully approved ${app.name}! They can now set up their profile.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${app.id}/approve`);
    }
  };

  const handleRejectApplication = async (id: string) => {
    if (!confirm("Reject this application?")) return;
    try {
      await updateDoc(doc(db, 'applications', id), { status: 'rejected' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `applications/${id}/reject`);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("This will add 15+ dummy professionals to your database. Continue?")) return;
    setIsSeeding(true);
    try {
      const catsSnap = await getDocs(collection(db, 'categories'));
      const cats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      
      const dummyProviders = [
        // Cleaning
        { name: "Rahul S.", specialty: "Deep Cleaning Expert", rating: 4.9, jobsCompleted: 450, price: 599, location: "Indiranagar, Bangalore", imageUrl: "https://images.unsplash.com/photo-1507152832244-10d45a7e3ad7?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'cleaning')?.id, packages: [
          { id: 'c1', name: 'Standard Deep Clean', price: 599, duration: '2-3 hours', description: 'Kitchen, bathroom and floor deep cleaning.', includes: ['Eco-friendly chemicals', 'Standard crew'] },
          { id: 'c2', name: 'Premium Full Home', price: 1499, duration: '5-6 hours', description: 'Complete sofa, mattress and cabinet cleaning.', includes: ['Steam cleaning', '3-man crew'] }
        ]},
        { name: "Priya M.", specialty: "Sofa & Carpet Specialist", rating: 4.8, jobsCompleted: 230, price: 399, location: "HSR Layout, Bangalore", imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'cleaning')?.id },
        
        // Electricians
        { name: "Amit Kumar", specialty: "Certified Electrician", rating: 4.7, jobsCompleted: 890, price: 199, location: "Koramangala, Bangalore", imageUrl: "https://images.unsplash.com/photo-1621905252507-b086d42df79c?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'electrician')?.id },
        { name: "Suresh Raina", specialty: "Inverter & UPS Expert", rating: 4.9, jobsCompleted: 1200, price: 249, location: "Electronic City, Bangalore", imageUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'electrician')?.id },

        // Salon
        { name: "Sneha Kapur", specialty: "Senior Stylist", rating: 4.9, jobsCompleted: 1560, price: 899, location: "Lavelle Road, Bangalore", imageUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'salon')?.id, packages: [
          { id: 's1', name: 'Glow Facial & Spa', price: 899, duration: '60 mins', description: 'Hydrating facial with shoulder massage.', includes: ['Herbal products'] },
          { id: 's2', name: 'Full Grooming Kit', price: 1899, duration: '120 mins', description: 'Waxing, threading and specialized hair treatment.', includes: ['All-in-one'] }
        ]},
        
        // Plumbers
        { name: "Vijay Singh", specialty: "Master Plumber", rating: 4.6, jobsCompleted: 670, price: 149, location: "Whitefield, Bangalore", imageUrl: "https://images.unsplash.com/photo-1621768216002-5ac171876a65?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'plumber')?.id },
        
        // Tutors
        { name: "Dr. Ananya P.", specialty: "Mathematics & Physics", rating: 5.0, jobsCompleted: 120, price: 500, location: "North Bangalore", imageUrl: "https://images.unsplash.com/photo-1573164574572-cb380ef0a6ad?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'tutor')?.id },

        // Painting
        { name: "Manjunath K.", specialty: "Wall Painting & Decor", rating: 4.8, jobsCompleted: 1100, price: 999, location: "Jayanagar, Bangalore", imageUrl: "https://images.unsplash.com/photo-1591807353724-698f121d4289?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'painting')?.id, packages: [
          { id: 'pn1', name: 'Single Room Fresh', price: 999, duration: '1 day', description: 'Fresh coat for one standard room.', includes: ['Basic labor', 'Supply check'] },
          { id: 'pn2', name: 'Premium Texture Wall', price: 4999, duration: '2 days', description: 'Specialized texture painting with metallic finish.', includes: ['Royal paint', 'Texture tools'] }
        ]},

        // Carpenter
        { name: "Irfan Khan", specialty: "Furniture Repair & Assembly", rating: 4.7, jobsCompleted: 340, price: 299, location: "Bannerghatta, Bangalore", imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5f9512df?auto=format&fit=crop&q=80&w=200", isAvailable: true, categoryId: cats.find(c => c.id === 'carpenter')?.id }
      ];

      for (const prov of dummyProviders) {
        await addDoc(collection(db, 'providers'), prov);
      }
      alert("Successfully seeded 15+ professionals!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'providers');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { 
        status, 
        updatedAt: new Date().toISOString() 
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.providerName?.toLowerCase().includes(search.toLowerCase()) || 
                         b.userName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Completed', value: stats.completed, color: '#10B981' },
    { name: 'Cancelled', value: stats.total - stats.pending - stats.completed, color: '#EF4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-black/10">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">UrbanHelp HQ</h1>
              <button 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" /> {isSeeding ? 'Seeding...' : 'Seed Data'}
              </button>
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Platform Command Center</p>
          </div>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <div className="px-6 py-2 border-r border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase">Live Revenue</div>
              <div className="text-xl font-black flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{stats.revenue}</div>
           </div>
           <div className="px-6 py-2">
              <div className="text-[10px] font-black text-gray-400 uppercase">Success Rate</div>
              <div className="text-xl font-black">{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
           </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Platform Bookings', value: stats.total, icon: <Users />, color: 'bg-indigo-50 text-indigo-600', trend: '+12%' },
          { label: 'Pending Requests', value: stats.pending, icon: <Clock />, color: 'bg-orange-50 text-orange-600', trend: 'Watch list' },
          { label: 'Fulfilled Jobs', value: stats.completed, icon: <CheckCircle />, color: 'bg-emerald-50 text-emerald-600', trend: 'High' },
          { label: 'Partner Payouts', value: `₹${stats.revenue}`, icon: <TrendingUp />, color: 'bg-blue-50 text-blue-600', trend: 'Rising' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              {stat.icon}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-gray-900 mb-4">{stat.value}</div>
            <div className="text-[10px] font-black px-2 py-1 bg-gray-50 rounded-full inline-block text-gray-500 uppercase tracking-tighter">
               {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 min-h-[450px]">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-xl font-black text-gray-900">Revenue Performance</h3>
               <div className="flex gap-2">
                  <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                  <span className="text-xs font-black text-gray-400 uppercase">Weekly View</span>
               </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
               <AreaChart data={chartData}>
                  <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         
         <div className="bg-white p-10 rounded-[3rem] border border-gray-100 min-h-[450px]">
            <h3 className="text-xl font-black text-gray-900 mb-12">Job Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
               <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Bookings & Apps Management UI */}
      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400 hover:text-black'}`}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('apps')}
              className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'apps' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400 hover:text-black'}`}
            >
              Pros Applied ({applications.length})
            </button>
          </div>
          
          {activeTab === 'bookings' && (
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-black outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'bookings' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-10 py-6">Customer / Contact</th>
                  <th className="px-10 py-6">Professional / Service</th>
                  <th className="px-10 py-6">Appointment Details</th>
                  <th className="px-10 py-6">Items & Notes</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900">{booking.userName}</div>
                      <div className="text-xs text-gray-400 font-bold">{booking.userPhone}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900">{booking.providerName}</div>
                      <div className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter">{booking.specialty}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-xs font-black text-gray-900 mb-1 flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5" /> {format(new Date(booking.serviceDate), 'MMM dd')}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" /> {booking.serviceTime || 'Unscheduled'}
                      </div>
                    </td>
                    <td className="px-10 py-8 max-w-xs">
                      <div className="flex flex-wrap gap-1 mb-2">
                         {booking.items?.map((it, idx) => (
                           <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded uppercase tracking-tighter">
                              {it}
                           </span>
                         ))}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium italic truncate">{booking.notes || 'No special instructions'}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                         <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm w-fit ${
                           booking.status === 'completed' ? 'bg-emerald-500 text-white' :
                           booking.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                         }`}>
                           {booking.status}
                         </span>
                         <div className="text-lg font-black flex items-center">
                            <IndianRupee className="w-3.5 h-3.5" />{booking.price || '0'}
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                           onClick={() => handleDelete(booking.id)}
                           className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-10 py-6">Applicant</th>
                  <th className="px-10 py-6">Contact / City</th>
                  <th className="px-10 py-6">Specialty</th>
                  <th className="px-10 py-6">Applied Date</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-10 py-8">
                       <div className="font-black text-gray-900">{app.name}</div>
                       <div className="text-[10px] font-black uppercase text-gray-400">Exp: {app.experience || 'Not specified'}</div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="font-bold text-gray-900">{app.phone}</div>
                       <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{app.city}</div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {app.specialty}
                       </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="text-xs font-bold text-gray-500 mb-1">
                          {app.createdAt?.seconds ? format(new Date(app.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                         app.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                         app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                       }`}>
                          {app.status}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex justify-end gap-2">
                          {app.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleApproveApplication(app)}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> Approve
                              </button>
                              <button 
                                onClick={() => handleRejectApplication(app.id)}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-black text-gray-300 uppercase italic">Decision Logged</span>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {((activeTab === 'bookings' && filteredBookings.length === 0) || (activeTab === 'apps' && applications.length === 0)) && (
            <div className="p-24 text-center">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">System Archive Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
