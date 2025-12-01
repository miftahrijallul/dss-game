'use client';

import { useState } from 'react';
import { Wand2, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface PredictionToolProps {
  metadata: any;
}

interface Recommendation {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface PredictionResult {
  success: boolean;
  prediction: string;
  probabilities: Record<string, number>;
  confidence: number;
  recommendations: Recommendation[];
}

export default function PredictionTool({ metadata }: PredictionToolProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  // Form state
  const [platform, setPlatform] = useState('PS4');
  const [genre, setGenre] = useState('Action');
  const [publisher, setPublisher] = useState('Electronic Arts');
  const [criticScore, setCriticScore] = useState(75);
  const [userScore, setUserScore] = useState(7.0);
  const [year, setYear] = useState(2026);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          genre,
          publisher,
          critic_score: criticScore,
          user_score: userScore,
          year
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Blockbuster': return 'from-pink-500 to-rose-500';
      case 'Hit': return 'from-green-500 to-emerald-500';
      case 'Moderate': return 'from-blue-500 to-indigo-500';
      case 'Low': return 'from-gray-500 to-slate-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Blockbuster': return '🏆';
      case 'Hit': return '⭐';
      case 'Moderate': return '📊';
      case 'Low': return '📉';
      default: return '🎮';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Prediction Tool</span>
        </h1>
        <p className="text-white/60">Predict video game success based on key characteristics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Game Details</h2>
          </div>

          <div className="space-y-5">
            {/* Platform */}
            <div>
              <label className="block text-white/70 text-sm mb-2">🎮 Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="input-field w-full"
              >
                {metadata?.platforms?.map((p: string) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-white/70 text-sm mb-2">🎯 Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="input-field w-full"
              >
                {metadata?.genres?.map((g: string) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-white/70 text-sm mb-2">🏢 Publisher</label>
              <select
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="input-field w-full"
              >
                {metadata?.publishers?.map((p: string) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  ⭐ Critic Score: <span className="text-white font-semibold">{criticScore}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criticScore}
                  onChange={(e) => setCriticScore(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-white/40 text-xs mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  👤 User Score: <span className="text-white font-semibold">{userScore.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={userScore}
                  onChange={(e) => setUserScore(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-white/40 text-xs mt-1">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-white/70 text-sm mb-2">
                📅 Planned Release Year: <span className="text-white font-semibold">{year}</span>
              </label>
              <input
                type="range"
                min="2025"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-white/40 text-xs mt-1">
                <span>2025</span>
                <span>2030</span>
              </div>
              <p className="text-white/40 text-xs mt-2">
                💡 Predict success for games planned to release in the future
              </p>
            </div>

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Predict Success
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Prediction Result Card */}
              <div className={`rounded-2xl p-6 bg-gradient-to-br ${getCategoryColor(result.prediction)} text-white`}>
                <div className="text-center">
                  <p className="text-white/80 mb-2">Predicted Category</p>
                  <div className="text-6xl mb-3">{getCategoryEmoji(result.prediction)}</div>
                  <h2 className="text-4xl font-bold mb-2">{result.prediction}</h2>
                  <p className="text-white/80">
                    Confidence: <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>

              {/* Probability Distribution */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Probability Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.probabilities)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, probability]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">{category}</span>
                          <span className="text-white font-semibold">{(probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-bar-fill bg-gradient-to-r ${getCategoryColor(category)}`}
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border-l-4 ${
                        rec.type === 'success' ? 'bg-green-500/10 border-green-500' :
                        rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                        rec.type === 'error' ? 'bg-red-500/10 border-red-500' :
                        'bg-blue-500/10 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div>
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <p className="text-white/60 text-sm mt-1">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Predict</h3>
              <p className="text-white/60 mb-6">
                Fill in the game details on the left and click "Predict Success" to see the analysis
              </p>
              
              {/* Feature Importance */}
              <div className="text-left mt-8">
                <h4 className="text-sm text-white/60 mb-3">Key Success Factors:</h4>
                <div className="space-y-2">
                  {metadata?.feature_importance
                    ?.sort((a: any, b: any) => b.Importance - a.Importance)
                    .map((feature: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">{feature.Feature.replace('_Encoded', '')}</span>
                          <span className="text-white/50">{(feature.Importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar h-1">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${feature.Importance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
