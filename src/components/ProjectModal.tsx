import { useApp } from '../context/AppContext';
import {
  X,
  Star,
  StarOff,
  Share2,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  HardDrive,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// ─── Fullscreen Lightbox ────────────────────────────────────────────
function Lightbox({
  images,
  index,
  setIndex,
  onClose,
}: {
  images: string[];
  index: number;
  setIndex: (fn: (i: number) => number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'fit' | 'full'>('fit');

  useEffect(() => {
    setZoom(1);
    setFitMode('fit');
  }, [index]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 5));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25));
      if (e.key === '0') {
        setZoom(1);
        setFitMode('fit');
      }
    },
    [images.length, onClose, setIndex],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const imgSrc = images[index];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm font-medium">
            {index + 1} / {images.length}
          </span>
          <span className="text-white/40 text-xs hidden sm:inline">
            Arrow keys to navigate &middot; +/- to zoom &middot; Esc to close
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-white/50 text-xs w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 5))}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button
            onClick={() => {
              setFitMode(m => (m === 'fit' ? 'full' : 'fit'));
              setZoom(1);
            }}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title={fitMode === 'fit' ? 'Show full size' : 'Fit to screen'}
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center">
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={() => setIndex(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}

        <div className="flex items-center justify-center min-h-full p-4">
          <img
            src={imgSrc}
            alt=""
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            className={
              fitMode === 'fit'
                ? 'max-w-full max-h-[calc(100vh-120px)] object-contain select-none transition-transform'
                : 'object-none select-none transition-transform'
            }
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-black/60 backdrop-blur-sm overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(() => i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === index
                  ? 'border-white shadow-lg shadow-white/20'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Modal ──────────────────────────────────────────────────
export default function ProjectModal() {
  const { selectedProject, setSelectedProject, toggleStar, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'tools'>('details');
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!selectedProject) return null;

  const projectImages =
    selectedProject.images && selectedProject.images.length > 0
      ? selectedProject.images
      : [
          `https://placehold.co/800x500/${selectedProject.color.replace('#', '')}/${selectedProject.color.replace('#', '')}22?text=${encodeURIComponent(selectedProject.name)}`,
        ];

  const message = encodeURIComponent(
    `Hello, I am interested in the project "${selectedProject.name}". I would like to discuss a similar design.`,
  );
  const emailHref = `mailto:${settings.email}?subject=Project enquiry: ${encodeURIComponent(selectedProject.name)}&body=${message}`;
  const whatsappHref = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${message}`;

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={projectImages}
          index={imageIndex}
          setIndex={setImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Project detail modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selectedProject.color + '15' }}
              >
                <FolderOpen size={20} style={{ color: selectedProject.color }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-gray-400 capitalize">
                  {selectedProject.category.replace('-', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleStar(selectedProject.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {selectedProject.starred ? (
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff size={18} className="text-gray-400" />
                )}
              </button>
              <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 size={18} className="text-gray-400" />
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-73px)]">
            {/* Image preview — natural aspect ratio, no cropping */}
            <div className="relative bg-gray-100">
              <div className="flex items-center justify-center overflow-hidden">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="relative w-full group cursor-zoom-in"
                  title="Click to view full size"
                >
                  <img
                    src={projectImages[imageIndex]}
                    alt={selectedProject.name}
                    className="w-full h-auto max-h-[55vh] object-contain"
                    draggable={false}
                    onContextMenu={e => e.preventDefault()}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-lg">
                      <Maximize2 size={16} className="text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        View full size
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImageIndex(
                        i => (i - 1 + projectImages.length) % projectImages.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() =>
                      setImageIndex(i => (i + 1) % projectImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {projectImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(() => i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === imageIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 px-4 sm:px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'tools'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tools Used
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProject.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Start from this project
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={emailHref}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <Mail size={14} />
                        Email
                      </a>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${settings.phone}`}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Phone size={14} />
                        Call
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs">Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedProject.date}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <HardDrive size={14} />
                        <span className="text-xs">Size</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedProject.size}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <FolderOpen size={14} />
                        <span className="text-xs">Category</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {selectedProject.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Tools Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map(tool => (
                        <span
                          key={tool}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProject.tools.map((tool, i) => (
                    <div
                      key={tool}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{tool}</p>
                        <p className="text-xs text-gray-400">Design Software</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
