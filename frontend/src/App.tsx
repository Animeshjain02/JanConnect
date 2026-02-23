import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import MapView from './pages/MapView';
import TransparencyDashboard from './pages/TransparencyDashboard';
import GovernmentProjects from './pages/GovernmentProjects';
import WhatsAppBotMock from './components/WhatsAppBotMock';

// Full-screen spinner shown while auth is being restored from localStorage
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm font-medium tracking-wide">Restoring session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Officer') return <Navigate to="/officer" replace />;
  return <CitizenDashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/officer" element={<ProtectedRoute roles={['Officer']}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/transparency" element={<ProtectedRoute><TransparencyDashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><GovernmentProjects /></ProtectedRoute>} />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <div className="h-screen flex flex-col">
              <div className="p-4 bg-slate-900 border-b border-white/10 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white tracking-tight">Civic Network Map</h1>
                <button onClick={() => window.history.back()} className="text-sm text-blue-400 font-bold">Close Map</button>
              </div>
              <div className="flex-1">
                <MapView />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<DashboardRedirect />} />
    </Routes>
  );
}

const GlobalWhatsAppBot = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === 'Citizen') {
    return <WhatsAppBotMock />;
  }
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <AppRoutes />
          <GlobalWhatsAppBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
