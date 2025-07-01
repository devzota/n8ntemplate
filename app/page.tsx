"use client";

import React, { useState, useEffect } from 'react';
import { Star, Eye, Download, User, Calendar, Hash, Zap, Globe, Settings, Search, Filter, ArrowUpRight, ChevronLeft, ChevronRight, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  author: string;
  created: string;
  stats: {
    views: number;
    downloads: number;
    rating: number;
  };
  tags: string[];
  isFree: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Dashboard = () => {
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async (page: number = 1, category: string = 'All', search: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category !== 'All' && { category }),
        ...(search && { search })
      });

      const response = await fetch(`/api/templates?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      setData(result.data || []);
      setPagination(result.pagination);
      
      if (category === 'All') {
        setCategories(['All', ...(result.categories || [])]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, selectedCategory, searchTerm);
  }, [currentPage, selectedCategory, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const openModal = (template: Template) => {
    setSelectedTemplate(template);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTemplate(null);
    document.body.style.overflow = 'unset';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI': return <Zap className="w-4 h-4" />;
      case 'Engineering': return <Settings className="w-4 h-4" />;
      case 'Sales': return <User className="w-4 h-4" />;
      case 'Marketing': return <Globe className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AI': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Engineering': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sales': return 'bg-green-100 text-green-700 border-green-200';
      case 'Marketing': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(pagination.totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const DetailModal = () => {
    if (!showModal || !selectedTemplate) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                {selectedTemplate.isFree && (
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold border border-green-200">
                    Free
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium border ${getCategoryColor(tag)}`}
                  >
                    {getCategoryIcon(tag)}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={closeModal}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-2xl font-bold">{formatNumber(selectedTemplate.stats.views)}</span>
                </div>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <Download className="w-5 h-5" />
                  <span className="text-2xl font-bold">{selectedTemplate.stats.downloads}</span>
                </div>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-2xl font-bold">{selectedTemplate.stats.rating}</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <div 
                className="bg-white p-8 rounded-xl space-y-6
                           [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2 [&_h2]:mb-4
                           [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
                           [&_ul]:space-y-2 [&_ul]:mb-6
                           [&_ol]:space-y-3 [&_ol]:mb-6
                           [&_li]:text-gray-700 [&_li]:leading-relaxed
                           [&_strong]:text-gray-900 [&_strong]:font-semibold
                           [&_a]:text-green-600 [&_a]:underline hover:[&_a]:text-blue-800"
                dangerouslySetInnerHTML={{ 
                  __html: selectedTemplate.html_content || '<p>Không có nội dung chi tiết</p>' 
                }}
              />
            </div>

            {/* Author & Date */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedTemplate.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedTemplate.author}</p>
                  <p className="text-sm text-gray-600">Template Creator</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created</span>
                </div>
                <p className="font-medium text-gray-900">{formatDate(selectedTemplate.created)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <a
                href={selectedTemplate.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                Open Template
              </a>
              <button
                onClick={closeModal}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Templates Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Templates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of professional templates to boost your productivity
          </p>
        </div>

        {/* Improved Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates by title, description, category, or author..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 text-gray-900 font-medium text-lg"
              />
            </div>

            {/* Category Filter - Dropdown for many categories */}
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium min-w-[200px] justify-between"
                >
                  <span>{selectedCategory}</span>
                  {showCategoryDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                          selectedCategory === category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular categories as quick filters */}
              <div className="flex flex-wrap gap-2 ml-4">
                {['AI', 'Engineering', 'Sales'].filter(cat => categories.includes(cat)).map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            {!loading && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {data.length} of {pagination.totalItems} templates
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading templates from Notion...</p>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      {item.isFree && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold border border-green-200">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags?.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${getCategoryColor(tag)}`}
                      >
                        {getCategoryIcon(tag)}
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Stats Section */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(item.stats?.views || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {item.stats?.downloads || 0}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        {item.stats?.rating || '4.0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Action Buttons */}
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {item.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-xs text-gray-700">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{formatDate(item.created).split(',')[0]}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <PaginationComponent />

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                handleSearchChange('');
                handleCategoryChange('All');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Footer Stats */}
        {!loading && data.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
                <div className="text-sm text-gray-600">Total Templates</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {data.length > 0 ? 
                    (data.reduce((acc, item) => acc + (item.stats?.rating || 4.0), 0) / data.length).toFixed(1) 
                    : '4.0'
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal />

      {/* Click outside to close dropdown */}
      {showCategoryDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowCategoryDropdown(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;