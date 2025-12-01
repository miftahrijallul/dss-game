'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';

interface DataExplorerProps {
  metadata: any;
}

interface Game {
  Name: string;
  Platform: string;
  Year_of_Release: number;
  Genre: string;
  Publisher: string;
  NA_Sales: number;
  EU_Sales: number;
  JP_Sales: number;
  Other_Sales: number;
  Global_Sales: number;
  Critic_Score: number;
  User_Score: number;
}

export default function DataExplorer({ metadata }: DataExplorerProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  
  // Filters
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('Global_Sales');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchGames();
  }, [page, platform, genre, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchGames();
    }, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      if (search) params.append('search', search);
      if (platform) params.append('platform', platform);
      if (genre) params.append('genre', genre);

      const response = await fetch(`/api/games?${params}`);
      const data = await response.json();
      
      setGames(data.games);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPlatform('');
    setGenre('');
    setPage(1);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Data Explorer</span>
        </h1>
        <p className="text-white/60">Explore and filter the video games dataset</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-white/60 text-sm mb-2">Search Game</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Platform Filter */}
          <div className="w-48">
            <label className="block text-white/60 text-sm mb-2">Platform</label>
            <select
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
              className="input-field w-full"
            >
              <option value="">All Platforms</option>
              {metadata?.platforms?.map((p: string) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Genre Filter */}
          <div className="w-48">
            <label className="block text-white/60 text-sm mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1); }}
              className="input-field w-full"
            >
              <option value="">All Genres</option>
              {metadata?.genres?.map((g: string) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-white/60">
          Showing <span className="text-white font-semibold">{games.length}</span> of{' '}
          <span className="text-white font-semibold">{total.toLocaleString()}</span> games
        </div>
        <div className="text-white/60 text-sm">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/60 font-medium">
                  <button 
                    onClick={() => handleSort('Name')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Name
                    {sortBy === 'Name' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="text-left p-4 text-white/60 font-medium">Platform</th>
                <th className="text-left p-4 text-white/60 font-medium">Year</th>
                <th className="text-left p-4 text-white/60 font-medium">Genre</th>
                <th className="text-left p-4 text-white/60 font-medium">Publisher</th>
                <th className="text-right p-4 text-white/60 font-medium">
                  <button 
                    onClick={() => handleSort('Global_Sales')}
                    className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                  >
                    Global Sales
                    {sortBy === 'Global_Sales' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="text-right p-4 text-white/60 font-medium">
                  <button 
                    onClick={() => handleSort('Critic_Score')}
                    className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                  >
                    Critic
                    {sortBy === 'Critic_Score' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="text-right p-4 text-white/60 font-medium">
                  <button 
                    onClick={() => handleSort('User_Score')}
                    className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                  >
                    User
                    {sortBy === 'User_Score' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="spinner mx-auto"></div>
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/40">
                    No games found matching your criteria
                  </td>
                </tr>
              ) : (
                games.map((game, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white truncate max-w-[250px]" title={game.Name}>
                        {game.Name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm">
                        {game.Platform}
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{game.Year_of_Release}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md text-sm">
                        {game.Genre}
                      </span>
                    </td>
                    <td className="p-4 text-white/70 truncate max-w-[150px]" title={game.Publisher}>
                      {game.Publisher}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-green-400 font-semibold">{game.Global_Sales.toFixed(2)}M</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-semibold ${game.Critic_Score >= 80 ? 'text-green-400' : game.Critic_Score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {game.Critic_Score}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-semibold ${game.User_Score >= 7 ? 'text-green-400' : game.User_Score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {game.User_Score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-white/10">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    page === pageNum 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
