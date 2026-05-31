import { useApp } from '../context/AppContext';
import { categories } from '../data/projects';
import {
  Folder,
  FileImage,
  Star,
  MoreVertical,
  Eye,
  Share2,
  Trash2,
  StarOff,
} from 'lucide-react';
import { useState } from 'react';
import LazyImage from './LazyImage';

function ContextMenu({ x, y, project, onClose }: { x: number; y: number; project: any; onClose: () => void }) {
  const { toggleStar, setSelectedProject, deleteProject, isAuthenticated } = useApp();

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 min-w-[180px] animate-in fade-in"
        style={{ top: y, left: x }}
      >
        <button
          onClick={() => { setSelectedProject(project); onClose(); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Eye size={16} /> Open
        </button>
        <button
          onClick={() => { toggleStar(project.id); onClose(); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {project.starred ? <StarOff size={16} /> : <Star size={16} />}
          {project.starred ? 'Unstar' : 'Star'}
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-share-modal', {
              detail: { id: project.id, name: project.name, color: project.color }
            }));
            onClose();
          }}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Share2 size={16} /> Share
        </button>
        {isAuthenticated && (
          <>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => { deleteProject(project.id); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Delete
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default function FileGrid() {
  const {
    viewMode,
    currentPage,
    selectedCategory,
    setSelectedCategory,
    setCurrentPage,
    getFilteredProjects,
    getProjectsByCategory,
    setSelectedProject,
  } = useApp();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; project: any } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, project: any) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, project });
  };

  const handleMoreClick = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 4, project });
  };

  // Show folders (categories) on main drive page
  if (currentPage === 'drive') {
    const allProjects = getFilteredProjects();
    const starredProjects = allProjects.filter(p => p.starred);

    return (
      <div className="p-4 sm:p-6">
        {/* Starred Section */}
        {starredProjects.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Star size={14} className="text-yellow-500" />
              Starred Projects
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {starredProjects.slice(0, 6).map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  onContextMenu={e => handleContextMenu(e, project)}
                  className="flex-shrink-0 w-40 sm:w-48 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group text-left"
                >
                  <div
                    className="h-24 sm:h-28 rounded-t-xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: project.color + '15' }}
                  >
                    {project.thumbnail ? (
                      <LazyImage src={project.thumbnail} alt={project.name} className="w-full h-full object-cover block" fallbackColor={project.color + '20'} />
                    ) : (
                      <FileImage size={40} style={{ color: project.color }} className="opacity-70" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-800 truncate">{project.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{project.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Folders Section */}
        <section className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Folders</h3>
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'space-y-1'
            }`}
          >
            {viewMode === 'grid' ? (
              <button
                onClick={() => setSelectedCategory('all')}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm hover:border-gray-300 transition-all group text-left"
              >
                <Folder size={28} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">All Projects</p>
                  <p className="text-xs text-gray-400">{allProjects.length} projects</p>
                </div>
                <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-400" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('all')}
                className="flex items-center gap-4 w-full px-4 py-2.5 bg-white hover:bg-gray-50 rounded-lg transition-all text-left"
              >
                <Folder size={24} className="text-gray-500" />
                <span className="flex-1 text-sm text-gray-800">All Projects</span>
                <span className="text-xs text-gray-400 hidden sm:block">-</span>
                <span className="text-xs text-gray-400 hidden sm:block">{allProjects.length} items</span>
              </button>
            )}
            {categories.map(cat => {
              const count = getProjectsByCategory(cat.id).length;
              if (viewMode === 'grid') {
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm hover:border-gray-300 transition-all group text-left"
                  >
                    <Folder size={28} style={{ color: cat.color }} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">{count} projects</p>
                    </div>
                    <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-400" />
                  </button>
                );
              }
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-4 w-full px-4 py-2.5 bg-white hover:bg-gray-50 rounded-lg transition-all text-left"
                >
                  <Folder size={24} style={{ color: cat.color }} />
                  <span className="flex-1 text-sm text-gray-800">{cat.name}</span>
                  <span className="text-xs text-gray-400 hidden sm:block">—</span>
                  <span className="text-xs text-gray-400 hidden sm:block">{count} items</span>
                </button>
              );
            })}
          </div>
        </section>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            project={contextMenu.project}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    );
  }

  // Category view
  if (currentPage === 'category' && selectedCategory) {
    const isAllProjects = selectedCategory === 'all';
    const cat = isAllProjects
      ? { id: 'all', name: 'All Projects', color: '#5f6368', icon: '' }
      : categories.find(c => c.id === selectedCategory);
    const projects = getProjectsByCategory(selectedCategory);

    return (
      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => setSelectedCategory(null)} className="hover:text-blue-600 transition-colors">
            My Drive
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{cat?.name}</span>
        </div>

        {/* Category header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: (cat?.color || '#4285F4') + '15' }}
          >
            {isAllProjects ? <Folder size={24} style={{ color: cat?.color }} /> : cat?.icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{cat?.name}</h2>
            <p className="text-sm text-gray-400">{projects.length} projects</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <Folder size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No projects in this category yet</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              >
                <div
                  className="h-28 sm:h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: project.color + '12' }}
                >
                  {project.thumbnail ? (
                    <LazyImage src={project.thumbnail} alt={project.name} className="w-full h-full object-cover block" fallbackColor={project.color + '20'} />
                  ) : (
                    <FileImage size={48} style={{ color: project.color }} className="opacity-60" />
                  )}
                  {project.starred && (
                    <Star size={14} className="absolute top-2 right-2 text-yellow-500 fill-yellow-500" />
                  )}
                  <button
                    onClick={e => handleMoreClick(e, project)}
                    className="absolute top-2 left-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <MoreVertical size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-800 truncate">{project.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{project.date}</p>
                    <p className="text-xs text-gray-300">{project.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
              <div className="col-span-6 sm:col-span-5">Name</div>
              <div className="col-span-3 sm:col-span-3 hidden sm:block">Tools</div>
              <div className="col-span-3 sm:col-span-2 hidden sm:block">Date</div>
              <div className="col-span-6 sm:col-span-2 text-right">Size</div>
            </div>
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="grid grid-cols-12 gap-4 px-4 py-2.5 hover:bg-gray-50 cursor-pointer items-center border-b border-gray-50 last:border-0"
              >
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <FileImage size={20} style={{ color: project.color }} className="flex-shrink-0" />
                  <span className="text-sm text-gray-800 truncate">{project.name}</span>
                  {project.starred && <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                </div>
                <div className="col-span-3 hidden sm:block text-xs text-gray-500 truncate">
                  {project.tools[0]}
                </div>
                <div className="col-span-2 hidden sm:block text-xs text-gray-500">
                  {project.date}
                </div>
                <div className="col-span-6 sm:col-span-2 text-xs text-gray-400 text-right">
                  {project.size}
                </div>
              </div>
            ))}
          </div>
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            project={contextMenu.project}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    );
  }

  // === Starred View ===
  if (currentPage === 'starred') {
    const starredProjects = getFilteredProjects()
      .filter(p => p.starred)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => setCurrentPage('drive')} className="hover:text-blue-600 transition-colors">
            My Drive
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Starred</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
            <Star size={24} className="text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Starred Projects</h2>
            <p className="text-sm text-gray-400">{starredProjects.length} starred project{starredProjects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {starredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Star size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No starred projects yet</p>
            <p className="text-xs text-gray-300 mt-1">Star projects to find them here quickly</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {starredProjects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              >
                <div className="h-28 sm:h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: project.color + '12' }}>
                  {project.thumbnail ? (
                    <LazyImage src={project.thumbnail} alt={project.name} className="w-full h-full object-cover block" fallbackColor={project.color + '20'} />
                  ) : (
                    <FileImage size={48} style={{ color: project.color }} className="opacity-60" />
                  )}
                  <Star size={14} className="absolute top-2 right-2 text-yellow-500 fill-yellow-500" />
                  <button onClick={e => handleMoreClick(e, project)}
                    className="absolute top-2 left-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <MoreVertical size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-800 truncate">{project.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{project.date}</p>
                    <p className="text-xs text-gray-300">{project.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
              <div className="col-span-6 sm:col-span-5">Name</div>
              <div className="col-span-3 sm:col-span-3 hidden sm:block">Category</div>
              <div className="col-span-3 sm:col-span-2 hidden sm:block">Date</div>
              <div className="col-span-6 sm:col-span-2 text-right">Size</div>
            </div>
            {starredProjects.map(project => (
              <div key={project.id} onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="grid grid-cols-12 gap-4 px-4 py-2.5 hover:bg-gray-50 cursor-pointer items-center border-b border-gray-50 last:border-0">
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <FileImage size={20} style={{ color: project.color }} className="flex-shrink-0" />
                  <span className="text-sm text-gray-800 truncate">{project.name}</span>
                  <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                </div>
                <div className="col-span-3 hidden sm:block text-xs text-gray-500 capitalize">{project.category.replace('-', ' ')}</div>
                <div className="col-span-2 hidden sm:block text-xs text-gray-500">{project.date}</div>
                <div className="col-span-6 sm:col-span-2 text-xs text-gray-400 text-right">{project.size}</div>
              </div>
            ))}
          </div>
        )}

        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} project={contextMenu.project} onClose={() => setContextMenu(null)} />}
      </div>
    );
  }

  // === Recent View ===
  if (currentPage === 'recent') {
    const recentProjects = [...getFilteredProjects()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
            <p className="text-sm text-gray-400">Most recent {recentProjects.length} project{recentProjects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-20">
            <FileImage size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No recent projects</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {recentProjects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              >
                <div className="h-28 sm:h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: project.color + '12' }}>
                  {project.thumbnail ? (
                    <LazyImage src={project.thumbnail} alt={project.name} className="w-full h-full object-cover block" fallbackColor={project.color + '20'} />
                  ) : (
                    <FileImage size={48} style={{ color: project.color }} className="opacity-60" />
                  )}
                  {project.starred && <Star size={14} className="absolute top-2 right-2 text-yellow-500 fill-yellow-500" />}
                  <button onClick={e => handleMoreClick(e, project)}
                    className="absolute top-2 left-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <MoreVertical size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-800 truncate">{project.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{project.date}</p>
                    <p className="text-xs text-gray-300">{project.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
              <div className="col-span-6 sm:col-span-5">Name</div>
              <div className="col-span-3 sm:col-span-3 hidden sm:block">Category</div>
              <div className="col-span-3 sm:col-span-2 hidden sm:block">Date</div>
              <div className="col-span-6 sm:col-span-2 text-right">Size</div>
            </div>
            {recentProjects.map(project => (
              <div key={project.id} onClick={() => setSelectedProject(project)}
                onContextMenu={e => handleContextMenu(e, project)}
                className="grid grid-cols-12 gap-4 px-4 py-2.5 hover:bg-gray-50 cursor-pointer items-center border-b border-gray-50 last:border-0">
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <FileImage size={20} style={{ color: project.color }} className="flex-shrink-0" />
                  <span className="text-sm text-gray-800 truncate">{project.name}</span>
                  {project.starred && <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                </div>
                <div className="col-span-3 hidden sm:block text-xs text-gray-500 capitalize">{project.category.replace('-', ' ')}</div>
                <div className="col-span-2 hidden sm:block text-xs text-gray-500">{project.date}</div>
                <div className="col-span-6 sm:col-span-2 text-xs text-gray-400 text-right">{project.size}</div>
              </div>
            ))}
          </div>
        )}

        {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} project={contextMenu.project} onClose={() => setContextMenu(null)} />}
      </div>
    );
  }

  // === Trash View (Admin only) ===
  if (currentPage === 'trash') {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Trash</h2>
            <p className="text-sm text-gray-400">Deleted projects are permanently removed</p>
          </div>
        </div>
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Trash2 size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm">Trash is empty</p>
          <p className="text-xs text-gray-300 mt-1">Deleted projects are permanently removed and cannot be recovered</p>
        </div>
      </div>
    );
  }

  return null;
}
