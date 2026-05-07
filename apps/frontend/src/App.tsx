import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { OpportunitiesListPage } from './pages/opportunities/OpportunitiesListPage';
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage';
import { OpportunityCreatePage } from './pages/opportunities/OpportunityCreatePage';
import { OpportunityEditPage } from './pages/opportunities/OpportunityEditPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { PublisherHistoryPage } from './pages/opportunities/PublisherHistoryPage';
import { OpportunityApplicantsPage } from './pages/opportunities/OpportunityApplicantsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminOpportunitiesPage } from './pages/admin/AdminOpportunitiesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/opportunities" replace />} />
        <Route path="/opportunities" element={<OpportunitiesListPage />} />
        <Route path="/opportunities/new" element={<OpportunityCreatePage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityEditPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-opportunities" element={<PublisherHistoryPage />} />
        <Route path="/my-opportunities/:id/applicants" element={<OpportunityApplicantsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/opportunities" element={<AdminOpportunitiesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
