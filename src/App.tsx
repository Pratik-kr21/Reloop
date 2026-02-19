import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DeviceCatalogPage from './pages/DeviceCatalogPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import TeardownRunnerPage from './pages/TeardownRunnerPage';
import TeardownCompletePage from './pages/TeardownCompletePage';
import LeaderboardPage from './pages/LeaderboardPage';
import MarketplacePage from './pages/MarketplacePage';
import DonatePage from './pages/DonatePage';
import RecyclePage from './pages/RecyclePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt';

import { useEffect } from 'react';
import { useAuthStore } from './lib/auth.store';

function App() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Router>
            <PWAUpdatePrompt />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/donate" element={<DonatePage />} />
                </Route>

                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/devices" element={<DeviceCatalogPage />} />
                <Route path="/device/:deviceId" element={<DeviceDetailPage />} />
                <Route path="/device/:deviceId/teardown" element={<TeardownRunnerPage />} />
                <Route path="/device/:deviceId/complete" element={<TeardownCompletePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/recycle" element={<RecyclePage />} />
            </Routes>
        </Router>
    );
}

export default App;
