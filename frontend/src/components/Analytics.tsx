'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon, Activity } from 'lucide-react';

interface AnalyticsProps {
  metadata: any;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#84cc16', '#ef4444'];

export default function Analytics({ metadata }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('clusters');
  const [clusterData, setClusterData] = useState<any>(null);
  const [genreData, setGenreData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [clusterRes, genreRes, platformRes, yearlyRes, corrRes] = await Promise.all([
        fetch('/api/cluster-data'),
        fetch('/api/analytics/genre'),
        fetch('/api/analytics/platform'),
        fetch('/api/analytics/yearly'),
        fetch('/api/analytics/correlation')
      ]);

      setClusterData(await clusterRes.json());
      setGenreData(await genreRes.json());
      setPlatformData(await platformRes.json());
      setYearlyData(await yearlyRes.json());
      setCorrelationData(await corrRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'clusters', label: 'Cluster Analysis', icon: PieChartIcon },
    { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'correlation', label: 'Correlation', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-white/60">Deep dive into video game market analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'clusters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Distribution */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Cluster Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clusterData?.cluster_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="label"
                    label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(clusterData?.cluster_distribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Cluster Scatter */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Sales vs Score by Cluster</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="Global_Sales" 
                    name="Global Sales" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    label={{ value: 'Global Sales (M)', position: 'bottom', fill: '#9ca3af' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="Critic_Score" 
                    name="Critic Score" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    label={{ value: 'Critic Score', angle: -90, position: 'left', fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: any) => [value, '']}
                  />
                  <Scatter 
                    name="Games" 
                    data={clusterData?.scatter_data?.slice(0, 200) || []} 
                    fill="#8b5cf6"
                  >
                    {(clusterData?.scatter_data?.slice(0, 200) || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.Cluster % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Stats */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Cluster Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(clusterData?.cluster_stats || []).map((stat: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                  style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: '4px' }}
                >
                  <h4 className="font-medium text-white mb-3">{stat.label}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Games</span>
                      <span className="text-white font-semibold">{stat.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Sales</span>
                      <span className="text-green-400 font-semibold">{stat.avg_sales?.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Critic</span>
                      <span className="text-yellow-400 font-semibold">{stat.avg_critic?.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg User</span>
                      <span className="text-cyan-400 font-semibold">{stat.avg_user?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Yearly Trend */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Yearly Sales & Game Count Trend</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="Year_of_Release" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total_sales"
                  name="Total Sales (M)"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="game_count"
                  name="Game Count"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score Trends */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">⭐ Average Score Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="Year_of_Release" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg_critic"
                  name="Avg Critic Score"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ fill: '#f43f5e' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_user"
                  name="Avg User Score (×10)"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Genre Comparison */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Genre Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={genreData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="Genre" stroke="#9ca3af" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar dataKey="total_sales" name="Total Sales (M)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="game_count" name="Game Count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Comparison */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎮 Platform Performance</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="Platform" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar dataKey="total_sales" name="Total Sales (M)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_sales" name="Avg Sales (M)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart - Genre Scores */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Genre Score Radar</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={genreData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="Genre" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar
                  name="Avg Critic Score"
                  dataKey="avg_critic"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Avg User Score (×10)"
                  dataKey={(d: any) => d.avg_user * 10}
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'correlation' && (
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🔗 Correlation Matrix</h3>
            <p className="text-white/60 text-sm mb-6">
              Shows the relationship strength between different variables. Values closer to 1 or -1 indicate stronger correlation.
            </p>
            
            {correlationData && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-white/60 font-medium"></th>
                      {Object.keys(correlationData).map((key) => (
                        <th key={key} className="p-3 text-center text-white/70 font-medium text-xs">
                          {key.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(correlationData).map((rowKey) => (
                      <tr key={rowKey} className="border-t border-white/5">
                        <td className="p-3 text-white/70 font-medium text-sm">{rowKey.replace('_', ' ')}</td>
                        {Object.keys(correlationData).map((colKey) => {
                          const value = correlationData[rowKey][colKey];
                          const absValue = Math.abs(value);
                          const bgOpacity = absValue * 0.8;
                          const bgColor = value >= 0 
                            ? `rgba(34, 197, 94, ${bgOpacity})` 
                            : `rgba(239, 68, 68, ${bgOpacity})`;
                          
                          return (
                            <td 
                              key={colKey} 
                              className="p-3 text-center text-white font-semibold text-sm"
                              style={{ backgroundColor: bgColor }}
                            >
                              {value.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💡 Key Insights</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="text-green-400 font-medium mb-1">Strong Positive Correlation</h4>
                  <p className="text-white/60 text-sm">
                    NA Sales and Global Sales show the strongest correlation ({correlationData?.NA_Sales?.Global_Sales?.toFixed(2)}), indicating North America is the key market driver.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-blue-400 font-medium mb-1">Score Impact</h4>
                  <p className="text-white/60 text-sm">
                    Critic Score has a correlation of {correlationData?.Critic_Score?.Global_Sales?.toFixed(2)} with Global Sales, higher than User Score ({correlationData?.User_Score?.Global_Sales?.toFixed(2)}).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <h4 className="text-yellow-400 font-medium mb-1">Regional Differences</h4>
                  <p className="text-white/60 text-sm">
                    Japan Sales shows different patterns compared to other regions, with lower correlation to NA/EU sales.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Top Correlations</h3>
              <div className="space-y-3">
                {correlationData && (
                  <>
                    <CorrelationBar 
                      label="NA Sales ↔ Global Sales" 
                      value={correlationData.NA_Sales?.Global_Sales || 0} 
                    />
                    <CorrelationBar 
                      label="EU Sales ↔ Global Sales" 
                      value={correlationData.EU_Sales?.Global_Sales || 0} 
                    />
                    <CorrelationBar 
                      label="Critic Score ↔ Global Sales" 
                      value={correlationData.Critic_Score?.Global_Sales || 0} 
                    />
                    <CorrelationBar 
                      label="User Score ↔ Global Sales" 
                      value={correlationData.User_Score?.Global_Sales || 0} 
                    />
                    <CorrelationBar 
                      label="JP Sales ↔ Global Sales" 
                      value={correlationData.JP_Sales?.Global_Sales || 0} 
                    />
                    <CorrelationBar 
                      label="Critic Score ↔ User Score" 
                      value={correlationData.Critic_Score?.User_Score || 0} 
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CorrelationBar({ label, value }: { label: string; value: number }) {
  const absValue = Math.abs(value);
  const isPositive = value >= 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/70">{label}</span>
        <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {value.toFixed(3)}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${absValue * 100}%` }}
        />
      </div>
    </div>
  );
}
