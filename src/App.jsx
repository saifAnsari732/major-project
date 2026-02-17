import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { lazy, Suspense } from 'react';
import CreateCourse from './pages/Create-course';
import CreateBranch from './pages/Create-branch';
import ButtomNav from './Buttom-navbR/Buttom-nav';
import CodeCompiler from './Buttom-navbR/CodeCompiler ';
import Calculator from './Buttom-navbR/calkulator';
import Navbar from './components/Navbar';
import ChatWidget from './Buttom-navbR/AI';
import ViewPaper from './pages/View-paper';
import SolvePaper from './pages/Solvepaper';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BranchList = lazy(() => import('./pages/BranchList'));
const BranchDetail = lazy(() => import('./pages/BranchDetail'));
const PaperDetail = lazy(() => import('./pages/PaperDetail'));
const UploadPaper = lazy(() => import('./pages/UploadPaper'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Chat = lazy(() => import('./pages/Chat'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Navbar/>
         <ButtomNav/>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/course/:courseId/branches" element={<BranchList />} />
        <Route path="/branch/:branchId" element={<BranchDetail />} />
        <Route path="/paper/:paperId" element={<PaperDetail />} />
        <Route path="/CreateCourse" element={<CreateCourse />} />
        <Route path="/CreateBranch" element={<CreateBranch />} />
        <Route path="/code-compiler" element={<CodeCompiler />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/aichat" element={<ChatWidget />} />
        <Route path="/paperview" element={<ViewPaper />} />
        <Route path="/solvepaper" element={<SolvePaper />} />
       
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route  
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPaper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
