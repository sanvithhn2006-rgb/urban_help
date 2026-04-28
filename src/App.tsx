import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Admin from './pages/Admin';
import History from './pages/History';
import Join from './pages/Join';
import ProviderDashboard from './pages/ProviderDashboard';
import { collection, getDocs, setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const syncUserAndSeed = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        // 1. Sync User Profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let userRole: 'user' | 'admin' = 'user';

        if (!userSnap.exists()) {
          // Check if this is the requested admin email or the first user
          const usersSnap = await getDocs(collection(db, 'users'));
          if (usersSnap.empty || user.email === 'sanvith.hn2006@gmail.com') {
            userRole = 'admin';
          }

          await setDoc(userRef, {
            id: user.uid,
            name: user.displayName || 'Anonymous User',
            email: user.email,
            role: userRole,
            createdAt: serverTimestamp()
          });
        } else {
          userRole = userSnap.data().role;
          // Upgrade to admin if email matches but role is not admin
          if (user.email === 'sanvith.hn2006@gmail.com' && userRole !== 'admin') {
            userRole = 'admin';
            await setDoc(userRef, { role: 'admin' }, { merge: true });
          }
        }
        
        setIsAdmin(userRole === 'admin');

        // 2. Seed Data (Only if admin)
        if (userRole === 'admin') {
          const providersSnap = await getDocs(collection(db, 'providers'));
          if (providersSnap.empty) {
            const initialProviders = [
              {
                id: 'p1',
                name: 'Ravi Kumar',
                specialty: 'Master Electrician',
                rating: 4.8,
                reviewCount: 124,
                jobsCompleted: 450,
                phone: '9876543210',
                location: 'Indiranagar, Bangalore',
                bio: 'Expert electrician with 10 years of experience in residential and commercial wiring.',
                categoryId: 'electrician',
                imageUrl: 'https://images.unsplash.com/photo-1621905252507-b086d42df79c?q=80&w=400&auto=format&fit=crop',
                price: 299,
                isAvailable: true,
                badges: ['Quick Service', 'Verified']
              },
              {
                id: 'p2',
                name: 'Anjali Sharma',
                specialty: 'Home Cleaning Expert',
                rating: 4.9,
                reviewCount: 890,
                jobsCompleted: 1200,
                phone: '9876500112',
                location: 'HSR Layout, Bangalore',
                bio: 'Deep cleaning professional with a focus on hygiene and organic cleaning products.',
                categoryId: 'cleaning',
                imageUrl: 'https://images.unsplash.com/photo-1557310737-14238e833481?q=80&w=400&auto=format&fit=crop',
                price: 499,
                isAvailable: true,
                badges: ['Top Rated', 'Trusted'],
                packages: [
                  { id: 'c1', name: 'Standard Cleaning', price: 499, duration: '2 hours', description: 'Basic dusting and mopping.', includes: ['Floor cleaning'] },
                  { id: 'c2', name: 'Deep Home Spa', price: 1999, duration: '5 hours', description: 'Complete deep cleaning of all rooms.', includes: ['Mopping', 'Windows', 'Kitchen'] }
                ]
              },
              {
                id: 'p3',
                name: 'Suresh Patil',
                specialty: 'Professional Plumber',
                rating: 4.6,
                reviewCount: 256,
                jobsCompleted: 600,
                phone: '9812345678',
                location: 'Electronic City, Bangalore',
                bio: '24/7 emergency plumbing services. Expert in pipe repairs.',
                categoryId: 'plumbing',
                imageUrl: 'https://images.unsplash.com/photo-1621768216002-5ac171876a65?q=80&w=400&auto=format&fit=crop',
                price: 199,
                isAvailable: true,
                badges: ['Available Today']
              },
              {
                id: 'p4',
                name: 'Dr. Priya Das',
                specialty: 'Maths & Science Tutor',
                rating: 5.0,
                reviewCount: 156,
                jobsCompleted: 300,
                phone: '9845012345',
                location: 'Koramangala, Bangalore',
                bio: 'Passionate educator with Ph.D. in Physics. 8 years teaching experience.',
                categoryId: 'tutor',
                imageUrl: 'https://images.unsplash.com/photo-1573164713988-8cd01712a32f?q=80&w=400&auto=format&fit=crop',
                price: 800,
                isAvailable: true,
                badges: ['Highly Recommended']
              },
              {
                id: 'p5',
                name: 'Mohit Singh',
                specialty: 'Elite Barber & Stylist',
                rating: 4.9,
                reviewCount: 420,
                jobsCompleted: 980,
                phone: '9822334455',
                location: 'Whitefield, Bangalore',
                bio: 'Professional stylist specializing in modern haircuts and grooming.',
                categoryId: 'salon',
                imageUrl: 'https://images.unsplash.com/photo-1503910321442-7fcf39a34932?q=80&w=400&auto=format&fit=crop',
                price: 399,
                isAvailable: true,
                badges: ['Certified']
              }
            ];

            for (const p of initialProviders) {
              await setDoc(doc(db, 'providers', p.id), p);
            }

            const initialCategories = [
              { id: 'electrician', name: 'Electricians', iconName: 'Zap' },
              { id: 'plumbing', name: 'Plumbers', iconName: 'Droplets' },
              { id: 'tutor', name: 'Tutors', iconName: 'GraduationCap' },
              { id: 'cleaning', name: 'Cleaning', iconName: 'Sparkles' },
              { id: 'salon', name: 'Salon', iconName: 'Scissors' },
              { id: 'painting', name: 'Painting', iconName: 'Paintbrush' },
              { id: 'carpenter', name: 'Carpenters', iconName: 'Hammer' }
            ];

            for (const c of initialCategories) {
              await setDoc(doc(db, 'categories', c.id), c);
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'users/providers/categories');
      }
    };
    
    if (!loading) {
      syncUserAndSeed();
    }
  }, [user, loading]);

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-black/5 selection:text-black">
        <Navbar />
        <main className="pt-24 min-h-[calc(100vh-80px)]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/join" element={<Join />} />
            <Route 
              path="/admin" 
              element={
                isAdmin === null ? <div className="p-20 text-center">Loading HQ...</div> :
                isAdmin ? <Admin /> : <Navigate to="/" />
              } 
            />
            <Route path="/provider" element={user ? <ProviderDashboard /> : <Navigate to="/" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
