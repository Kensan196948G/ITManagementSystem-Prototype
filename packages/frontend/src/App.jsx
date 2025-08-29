import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { 
  Dashboard, 
  IncidentManagement, 
  ProblemManagement, 
  ChangeManagement, 
  ServiceCatalog, 
  ConfigurationManagement, 
  KnowledgeBase, 
  Reports, 
  Settings 
} from './pages/index.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/incidents" element={<IncidentManagement />} />
              <Route path="/problems" element={<ProblemManagement />} />
              <Route path="/changes" element={<ChangeManagement />} />
              <Route path="/service-catalog" element={<ServiceCatalog />} />
              <Route path="/configuration" element={<ConfigurationManagement />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;