'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import DataExplorer from '@/components/DataExplorer';
import PredictionTool from '@/components/PredictionTool';
import Analytics from '@/components/Analytics';
import Recommendations from '@/components/Recommendations';

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const response = await fetch('/api/metadata');
      const data = await response.json();
      setMetadata(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard metadata={metadata} />;
      case 'explorer':
        return <DataExplorer metadata={metadata} />;
      case 'prediction':
        return <PredictionTool metadata={metadata} />;
      case 'analytics':
        return <Analytics metadata={metadata} />;
      case 'recommendations':
        return <Recommendations metadata={metadata} />;
      default:
        return <Dashboard metadata={metadata} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white/70">Loading DSS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} metadata={metadata} />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
