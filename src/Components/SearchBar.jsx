import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Folder, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // All searchable pages
  const searchablePages = [
    // Departments
    { name: 'General Department', path: '/general', type: 'department', icon: Folder },
    { name: 'Admin & Finance Department', path: '/admin-finance', type: 'department', icon: Folder },
    { name: 'Technical Department', path: '/technical', type: 'department', icon: Folder },
    { name: 'Corporate Affairs Department', path: '/corporate-affairs', type: 'department', icon: Folder },
    { name: 'Directorate', path: '/directorate', type: 'department', icon: Folder },
    
    // General sub-modules
    { name: 'Policies', path: '/general/policies', type: 'page', icon: FileText, parent: 'General' },
    { name: 'Stakeholders', path: '/general/stakeholders', type: 'page', icon: FileText, parent: 'General' },
    { name: 'IMSWG', path: '/general/imswg', type: 'page', icon: FileText, parent: 'General' },

    // Admin & Finance sub-modules
    { name: 'Employee Data', path: '/admin-finance/employee-data', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    { name: 'Payroll', path: '/admin-finance/payroll', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    { name: 'Admin Assets', path: '/admin-finance/assets', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    { name: 'Budgets', path: '/admin-finance/budgets', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    { name: 'Procurement', path: '/admin-finance/procurement', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    { name: 'HR', path: '/admin-finance/hr', type: 'page', icon: FileText, parent: 'Admin & Finance' },
    
    // Technical sub-modules
    { name: 'Research', path: '/technical/research', type: 'page', icon: FileText, parent: 'Technical' },

    // Corporate Affairs sub-modules
    { name: 'Assets', path: '/corporate-affairs/assets', type: 'page', icon: FileText, parent: 'Corporate Affairs' },
    { name: 'Corporate Stakeholders', path: '/corporate-affairs/stakeholders', type: 'page', icon: FileText, parent: 'Corporate Affairs' },
    { name: 'IT', path: '/corporate-affairs/it', type: 'page', icon: FileText, parent: 'Corporate Affairs' },
    
    // Directorate sub-modules
    { name: 'Executive Management', path: '/directorate/executive-management', type: 'page', icon: FileText, parent: 'Directorate' },
    { name: 'Board of Directors', path: '/directorate/board-of-directors', type: 'page', icon: FileText, parent: 'Directorate' }
  ];

  // Search logic
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = searchablePages.filter(page =>
      page.name.toLowerCase().includes(query.toLowerCase()) ||
      page.parent?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments and pages..."
          className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((result) => {
            const Icon = result.icon;
            return (
              <button
                key={result.path}
                onClick={() => handleSelect(result.path)}
                className="w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
              >
                <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{result.name}</p>
                  {result.parent && (
                    <p className="text-sm text-gray-500">{result.parent}</p>
                  )}
                  <p className="text-xs text-gray-400 capitalize">{result.type}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-gray-500 text-center">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}