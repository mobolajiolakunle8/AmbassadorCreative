import { useApp } from '../context/AppContext';
import {
  Search,
  Grid3X3,
  List,
  Menu,
  HelpCircle,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';

export default function TopBar() {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, setSidebarOpen, currentPage, syncStatus, theme, toggleTheme, about, setCurrentPage, isAuthenticated } = useApp();
  const initials = about.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'about': return 'About Me';
      case 'contact': return 'Contact';
      case 'admin': return 'Admin Dashboard';
      case 'category': return 'Projects';
      default: return 'My Drive';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-16">
        {/* Menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
        >
          <Menu size={22} className="text-gray-600" />
        </button>

        {/* Page title - hidden on mobile */}
        <h2 className="hidden sm:block text-lg font-normal text-gray-800 min-w-[120px]">
          {getPageTitle()}
        </h2>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tools, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-full text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-gray-200 focus:shadow-sm focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>

          {/* Mobile view toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {viewMode === 'grid' ? <List size={20} className="text-gray-600" /> : <Grid3X3 size={20} className="text-gray-600" />}
          </button>

          {/* Sync status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50" title={`Cloud sync: ${syncStatus}`}>
            <span className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
          </div>

          <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle size={20} className="text-gray-500" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} className="text-gray-500" /> : <Sun size={20} className="text-yellow-500" />}
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
          >
            <Lock size={20} className={isAuthenticated ? 'text-blue-500' : 'text-gray-500'} />
          </button>

          {/* User avatar */}
          {about.websiteDp ? (
            <img
              src={about.websiteDp}
              alt={about.name}
              className="w-9 h-9 rounded-full object-cover cursor-pointer hover:shadow-md transition-shadow"
              draggable={false}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-md transition-shadow">
              {initials || 'MO'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
