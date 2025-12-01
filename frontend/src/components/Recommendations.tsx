'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gamepad2, 
  Award, 
  Map, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Star,
  Zap
} from 'lucide-react';

interface RecommendationsProps {
  metadata: any;
}

interface RecommendationCard {
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  items: string[];
}

export default function Recommendations({ metadata }: RecommendationsProps) {
  const [activeSection, setActiveSection] = useState('strategic');
  const [rulesData, setRulesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics/rules');
      if (res.ok) {
        const data = await res.json();
        setRulesData(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
    setLoading(false);
  };

  const sections = [
    { id: 'strategic', label: 'Strategic Insights', icon: Target },
    { id: 'publisher', label: 'For Publishers', icon: Gamepad2 },
    { id: 'developer', label: 'For Developers', icon: Users },
    { id: 'investor', label: 'For Investors', icon: DollarSign },
    { id: 'rules', label: 'Association Rules', icon: BarChart3 },
  ];

  const strategicRecommendations: RecommendationCard[] = [
    {
      title: 'High Sales Potential',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      items: [
        'Action and Sports genres consistently show strong sales performance',
        'Focus on North America and Europe as primary markets (85%+ of global sales)',
        'Target Critic Score above 75 for better commercial success',
        'Platform choice matters: PS3, X360, PS4 show highest average sales'
      ]
    },
    {
      title: 'Market Trends',
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      items: [
        'The gaming market has evolved significantly from 2000-2016',
        'Multi-platform releases maximize market reach',
        'Digital distribution is changing the sales landscape',
        'Mobile gaming and indie titles are emerging segments'
      ]
    },
    {
      title: 'Success Factors',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      items: [
        'High critic scores correlate with better sales than user scores',
        'Established IPs and franchises have higher success rates',
        'Marketing timing and seasonal releases impact performance',
        'Publisher reputation affects initial sales momentum'
      ]
    },
    {
      title: 'Risk Factors',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      items: [
        'Niche genres have lower average sales but dedicated audiences',
        'Over-saturated genres face higher competition',
        'Japan market preferences differ significantly from Western markets',
        'Late platform releases may miss peak user base'
      ]
    }
  ];

  const publisherRecommendations = [
    {
      icon: CheckCircle,
      priority: 'High',
      priorityColor: 'bg-green-500',
      title: 'Optimize Genre-Platform Combinations',
      description: 'Based on historical data, certain genre-platform combinations yield significantly higher average sales. Action games on PlayStation platforms and Sports games on Xbox show consistently strong performance.'
    },
    {
      icon: Target,
      priority: 'High',
      priorityColor: 'bg-green-500',
      title: 'Focus on Critic Scores',
      description: 'Games with Critic Score > 80 have 3x higher average sales. Invest in quality assurance and polish before release. Consider review embargoes strategically.'
    },
    {
      icon: Map,
      priority: 'Medium',
      priorityColor: 'bg-yellow-500',
      title: 'Regional Localization Strategy',
      description: 'Japan prefers different genres (RPG, Fighting) compared to Western markets (Action, Shooter). Customize marketing and features for each region.'
    },
    {
      icon: Zap,
      priority: 'Medium',
      priorityColor: 'bg-yellow-500',
      title: 'Release Timing Optimization',
      description: 'Avoid crowded release windows. Q4 releases capture holiday sales but face more competition. Consider Q1-Q2 for less competitive launches.'
    },
    {
      icon: Award,
      priority: 'Low',
      priorityColor: 'bg-blue-500',
      title: 'Build IP Value',
      description: 'Successful franchises have higher average sales than new IPs. Focus on creating games with sequel and expansion potential.'
    }
  ];

  const developerRecommendations = [
    {
      icon: Gamepad2,
      category: 'Game Design',
      items: [
        'Action and Sports genres have proven market demand',
        'Balance innovation with familiar mechanics',
        'Consider cross-platform development for wider reach',
        'Quality over quantity - polished games sell better'
      ]
    },
    {
      icon: Users,
      category: 'Target Audience',
      items: [
        'Understand regional preferences (Western vs Japan)',
        'Hardcore vs casual audience considerations',
        'Age ratings affect market size',
        'Community engagement drives long-term success'
      ]
    },
    {
      icon: TrendingUp,
      category: 'Development Strategy',
      items: [
        'Set realistic scope based on market expectations',
        'Plan for post-launch content and updates',
        'Build for the current generation platforms',
        'Consider early access for community feedback'
      ]
    }
  ];

  const investorMetrics = [
    { label: 'High Success Rate Genres', value: 'Action, Sports, Shooter', trend: 'up' },
    { label: 'Key Markets', value: 'NA (45%), EU (28%), JP (12%)', trend: 'up' },
    { label: 'Avg Sales (Critic Score > 80)', value: '2.5M+ units', trend: 'up' },
    { label: 'Platform Leaders', value: 'PlayStation, Xbox, Nintendo', trend: 'stable' },
    { label: 'Risk Factor', value: 'New IP vs Franchise', trend: 'down' },
    { label: 'Model Accuracy', value: `${((metadata?.model_accuracy || 0) * 100).toFixed(1)}%`, trend: 'up' }
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
          <span className="gradient-text">Recommendations</span>
        </h1>
        <p className="text-white/60">Strategic insights and actionable recommendations based on data analysis</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Strategic Insights */}
      {activeSection === 'strategic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategicRecommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className={`glass rounded-2xl p-6 border ${rec.bgColor}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${rec.bgColor}`}>
                    <Icon className={`w-6 h-6 ${rec.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                </div>
                <ul className="space-y-3">
                  {rec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${rec.color}`} />
                      <span className="text-white/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Publisher Recommendations */}
      {activeSection === 'publisher' && (
        <div className="space-y-4">
          {publisherRecommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.priorityColor} text-white`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-white/60">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Developer Recommendations */}
      {activeSection === 'developer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {developerRecommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{rec.category}</h3>
                </div>
                <ul className="space-y-3">
                  {rec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Investor Metrics */}
      {activeSection === 'investor' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">📊 Key Investment Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investorMetrics.map((metric, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">{metric.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      metric.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                      metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                  <span className="text-white font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">✅ Positive Indicators</h3>
              <ul className="space-y-3">
                {[
                  'Established franchise with proven track record',
                  'Experienced development team',
                  'Target Critic Score > 75',
                  'Multi-platform release strategy',
                  'Strong publisher backing',
                  'Action/Sports/Shooter genre'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚠️ Risk Factors</h3>
              <ul className="space-y-3">
                {[
                  'New IP with unproven concept',
                  'Niche genre with limited audience',
                  'Single platform exclusive',
                  'Crowded release window',
                  'Inexperienced development team',
                  'Japan-only target market'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROI Potential */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💰 ROI Potential by Cluster</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metadata?.cluster_labels && Object.entries(metadata.cluster_labels).map(([key, label]: [string, any]) => (
                <div 
                  key={key}
                  className={`p-4 rounded-xl border ${
                    key === '0' ? 'bg-green-500/10 border-green-500/30' :
                    key === '1' ? 'bg-blue-500/10 border-blue-500/30' :
                    key === '2' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <h4 className="font-medium text-white mb-2">{label}</h4>
                  <p className="text-xs text-white/60">
                    {key === '0' ? 'Highest ROI potential with global sales > 5M. Rare but extremely profitable.' :
                     key === '1' ? 'Strong ROI with sales 2-5M. Good investment target.' :
                     key === '2' ? 'Moderate returns with sales 1-2M. Lower risk.' :
                     'Limited ROI with sales < 1M. High risk.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Association Rules */}
      {activeSection === 'rules' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">📜 Association Rules from Data Mining</h3>
            <p className="text-white/60 text-sm mb-6">
              These rules were discovered using the Apriori algorithm, showing patterns in successful games.
            </p>
            
            {rulesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/70 font-medium">Antecedent (If)</th>
                      <th className="text-left p-3 text-white/70 font-medium">Consequent (Then)</th>
                      <th className="text-center p-3 text-white/70 font-medium">Support</th>
                      <th className="text-center p-3 text-white/70 font-medium">Confidence</th>
                      <th className="text-center p-3 text-white/70 font-medium">Lift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rulesData.slice(0, 15).map((rule, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                            {rule.antecedent}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
                            {rule.consequent}
                          </span>
                        </td>
                        <td className="p-3 text-center text-white/70">{(rule.support * 100).toFixed(1)}%</td>
                        <td className="p-3 text-center">
                          <span className={`font-medium ${rule.confidence > 0.7 ? 'text-green-400' : rule.confidence > 0.5 ? 'text-yellow-400' : 'text-white/70'}`}>
                            {(rule.confidence * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-medium ${rule.lift > 1.5 ? 'text-green-400' : 'text-white/70'}`}>
                            {rule.lift.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No association rules data available.</p>
                <p className="text-white/40 text-sm mt-2">Rules will be generated from game success pattern analysis.</p>
              </div>
            )}
          </div>

          {/* Rules Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-2">Support</h4>
              <p className="text-white/60 text-sm">
                How frequently the itemset appears in the dataset. Higher support means the pattern is more common.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-2">Confidence</h4>
              <p className="text-white/60 text-sm">
                How often the rule is true. A confidence of 80% means the consequent appears in 80% of transactions containing the antecedent.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-2">Lift</h4>
              <p className="text-white/60 text-sm">
                Indicates the strength of the rule. Lift &gt; 1 means the items are positively correlated; higher values indicate stronger associations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
