'use client';

import { 
  LayoutDashboard, 
  Database, 
  Wand2, 
  BarChart3, 
  Lightbulb,
  Gamepad2,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  metadata: any;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explorer', label: 'Data Explorer', icon: Database },
  { id: 'prediction', label: 'Prediction Tool', icon: Wand2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
];

export default function Sidebar({ activeMenu, setActiveMenu, metadata }: SidebarProps) {
  return (
    <aside className="sidebar w-72 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">DSS Games</h1>
            <p className="text-xs text-white/50">Decision Support System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-4 px-4">Main Menu</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`sidebar-item w-full ${activeMenu === item.id ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Stats Card */}
      <div className="p-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Model Accuracy</p>
              <p className="text-white font-bold text-lg">
                {metadata ? `${(metadata.model_accuracy * 100).toFixed(1)}%` : '--'}
              </p>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: metadata ? `${metadata.model_accuracy * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-white/30 text-xs">Video Games Analysis</p>
          <p className="text-white/50 text-xs mt-1">UAS Project © 2025</p>
        </div>
      </div>
    </aside>
  );
}
