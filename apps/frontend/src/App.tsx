import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { OpportunitiesListPage } from './pages/opportunities/OpportunitiesListPage';
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage';
import { OpportunityCreatePage } from './pages/opportunities/OpportunityCreatePage';
import { OpportunityEditPage } from './pages/opportunities/OpportunityEditPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
