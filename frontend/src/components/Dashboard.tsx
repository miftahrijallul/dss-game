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
  Legend
} from 'recharts';
import { Gamepad2, TrendingUp, Star, Users, Globe, DollarSign } from 'lucide-react';

interface DashboardProps {
  metadata: any;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f43f5e', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];

export default function Dashboard({ metadata }: DashboardProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chartRes, summaryRes] = await Promise.all([
        fetch('/api/chart-data'),
        fetch('/api/analytics/summary')
      ]);
      
      const chartJson = await chartRes.json();
      const summaryJson = await summaryRes.json();
      
      setChartData(chartJson);
      setSummary(summaryJson);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading || !chartData || !summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  // Prepare chart data
  const genreSalesData = Object.entries(chartData.genre_sales)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  const platformSalesData = Object.entries(chartData.platform_sales)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const regionalData = [
    { name: 'North America', value: chartData.regional_sales.NA_Sales },
    { name: 'Europe', value: chartData.regional_sales.EU_Sales },
    { name: 'Japan', value: chartData.regional_sales.JP_Sales },
    { name: 'Other', value: chartData.regional_sales.Other_Sales },
  ];

  const yearlySalesData = Object.entries(chartData.yearly_sales)
    .map(([year, value]) => ({ year: Number(year), sales: Number(value) }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-white/60">Video Games Success Analysis Overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Gamepad2 className="w-6 h-6" />}
          title="Total Games"
          value={summary.total_games.toLocaleString()}
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Sales"
          value={`${summary.total_sales.toFixed(1)}M`}
          gradient="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={<Star className="w-6 h-6" />}
          title="Avg Critic Score"
          value={summary.avg_critic_score.toFixed(1)}
          gradient="from-orange-500 to-red-500"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Avg User Score"
          value={summary.avg_user_score.toFixed(1)}
          gradient="from-cyan-500 to-blue-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Genre Sales Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Sales by Genre</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreSalesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}M`, 'Sales']}
              />
              <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🌍 Regional Sales Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {regionalData.map((entry, index) => (
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
                formatter={(value: number) => [`${value.toFixed(1)}M`, 'Sales']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Platform Sales */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🎮 Top Platforms</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}M`, 'Sales']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {platformSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Trend */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Yearly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yearlySalesData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}M`, 'Sales']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#667eea"
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Top Performers</h3>
          <div className="space-y-4">
            <StatItem label="Best Genre" value={summary.top_genre} />
            <StatItem label="Best Platform" value={summary.top_platform} />
            <StatItem label="Top Publisher" value={summary.top_publisher} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Data Coverage</h3>
          <div className="space-y-4">
            <StatItem label="Platforms" value={summary.unique_platforms} />
            <StatItem label="Genres" value={summary.unique_genres} />
            <StatItem label="Publishers" value={summary.unique_publishers} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📅 Time Range</h3>
          <div className="space-y-4">
            <StatItem label="From Year" value={summary.year_range.min} />
            <StatItem label="To Year" value={summary.year_range.max} />
            <StatItem label="Years Covered" value={summary.year_range.max - summary.year_range.min + 1} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, title, value, gradient }: { icon: React.ReactNode; title: string; value: string; gradient: string }) {
  return (
    <div className="metric-card card-hover">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/60">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
