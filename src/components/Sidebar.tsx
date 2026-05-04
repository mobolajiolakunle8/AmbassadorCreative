import { useApp } from '../context/AppContext';
import { categories } from '../data/projects';
import {
  FolderOpen,
  Home,
  User,
  Mail,
  Settings,
  Star,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { currentPage, setCurrentPage, selectedCategory, setSelectedCategory, sidebarOpen, setSidebarOpen, isAuthenticated, getProjectsByCategory, about } = useApp();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const initials = about.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    { id: 'drive' as const, label: 'My Drive', icon: Home },
    { id: 'about' as const, label: 'About Me', icon: User },
    { id: 'contact' as const, label: 'Contact', icon: Mail },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          bg-white border-r border-gray-200 flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
          ${currentPage === 'admin' && isAuthenticated ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {about.websiteDp ? (
              <img src={about.websiteDp} alt={about.name} className="w-10 h-10 rounded-full object-cover" draggable={false} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {initials || 'M'}
              </div>
            )}
            <div>
              <h1 className="text-sm font-semibold text-gray-800">{about.name}</h1>
              <p className="text-xs text-gray-500">{about.title}</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 hover:bg-gray-100 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {/* Main Nav */}
          <div className="mb-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${currentPage === item.id && !selectedCategory
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 border-t border-gray-100" />

          {/* Projects Folders */}
          <div>
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
            >
              {projectsExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <FolderOpen size={20} />
              <span>Projects</span>
            </button>

            {projectsExpanded && (
              <div className="ml-4 mt-1 space-y-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm transition-all
                    ${selectedCategory === 'all'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <FolderOpen size={16} className="text-gray-500" />
                  <span className="flex-1 text-left">All Projects</span>
                  <span className="text-xs text-gray-400">{getProjectsByCategory('all').length}</span>
                </button>
                {categories.map(cat => {
                  const count = getProjectsByCategory(cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm transition-all
                        ${selectedCategory === cat.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="flex-1 text-left">{cat.name}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 border-t border-gray-100" />

          {/* Quick Access */}
          <div className="space-y-0.5">
            <button className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all">
              <Star size={20} className="text-yellow-500" />
              <span>Starred</span>
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all">
              <Clock size={20} className="text-gray-400" />
              <span>Recent</span>
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-all">
              <Trash2 size={20} className="text-gray-400" />
              <span>Trash</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 border-t border-gray-100" />

          {/* Faint icon-only admin access */}
          <button
            onClick={() => setCurrentPage('admin')}
            title="Admin Dashboard"
            aria-label="Admin Dashboard"
            className={`ml-4 w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${currentPage === 'admin'
                ? 'bg-blue-50 text-blue-700 opacity-70'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 opacity-35 hover:opacity-100'
              }`}
          >
            <Settings size={18} />
          </button>
        </nav>

      </aside>
    </>
  );
}
