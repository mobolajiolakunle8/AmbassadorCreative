import { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FileGrid from './components/FileGrid';
import ProjectModal from './components/ProjectModal';
import AboutPage from './components/AboutPage';
import CVPage from './components/CVPage';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';
import { X, Copy, Check, MessageCircle, Mail, Link2, Share2 } from 'lucide-react';

// ─── Share Modal ────────────────────────────────────────────────────
function ShareModal({ projectId, projectName, projectColor, onClose }: {
  projectId: string; projectName: string; projectColor: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [waCopied, setWaCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shareUrl = window.location.origin + window.location.pathname + '?project=' + projectId;
  const shareText = 'Check out "' + projectName + '" on my portfolio';
  const waText = encodeURIComponent(shareText + '\n' + shareUrl);
  const emailSubject = encodeURIComponent('Portfolio: ' + projectName);
  const emailBody = encodeURIComponent(shareText + '\n\nView project: ' + shareUrl);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { if (inputRef.current) { inputRef.current.select(); document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2500); } }
  };
  const copyWaMsg = async () => {
    try { await navigator.clipboard.writeText(shareText + '\n' + shareUrl); setWaCopied(true); setTimeout(() => setWaCopied(false), 2500); } catch {}
  };
  const nativeShare = async () => { if (navigator.share) { try { await navigator.share({ title: projectName, text: shareText, url: shareUrl }); } catch {} } };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0"><Share2 size={18} className="text-blue-500 flex-shrink-0" /><h3 className="text-base font-semibold text-gray-800 truncate">Share Project</h3></div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: projectColor + '15' }}><Link2 size={18} style={{ color: projectColor }} /></div>
            <div className="min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{projectName}</p><p className="text-xs text-gray-400 truncate">{shareUrl}</p></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Shareable Link</label>
            <div className="flex gap-2">
              <input ref={inputRef} type="text" readOnly value={shareUrl} onClick={e => (e.target as HTMLInputElement).select()} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none truncate" />
              <button onClick={copyLink} className={'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ' + (copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700')}>
                {copied ? <Check size={16} /> : <Copy size={16} />}<span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><Check size={12} /> Link copied to clipboard!</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Share via</label>
            <div className="grid grid-cols-3 gap-2">
              <a href={'https://wa.me/?text=' + waText} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"><MessageCircle size={22} className="text-green-600" /><span className="text-[11px] font-medium text-green-700">WhatsApp</span></a>
              <a href={'mailto:?subject=' + emailSubject + '&body=' + emailBody} className="flex flex-col items-center gap-1.5 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Mail size={22} className="text-red-500" /><span className="text-[11px] font-medium text-red-600">Email</span></a>
              <button onClick={copyWaMsg} className="flex flex-col items-center gap-1.5 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">{waCopied ? <Check size={22} className="text-green-500" /> : <Copy size={22} className="text-purple-500" />}<span className="text-[11px] font-medium text-purple-600">{waCopied ? 'Copied!' : 'Copy Text'}</span></button>
            </div>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (<button onClick={nativeShare} className="w-full mt-2 flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"><Share2 size={18} className="text-blue-500" /><span className="text-sm font-medium text-blue-600">Share via device</span></button>)}
          </div>
          <p className="text-[11px] text-gray-400 text-center">Anyone with this link can view the project on your portfolio.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content Router ────────────────────────────────────────────
function MainContent() {
  const { currentPage } = useApp();
  switch (currentPage) {
    case 'about': return <AboutPage />;
    case 'cv': return <CVPage />;
    case 'contact': return <ContactPage />;
    case 'admin': return <AdminDashboard />;
    default: return <FileGrid />;
  }
}

// ─── Meta tag helper ────────────────────────────────────────────────
function setMeta(id: string, attr: string, value: string) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

// ─── Layout ─────────────────────────────────────────────────────────
function Layout() {
  const { projects, setSelectedProject } = useApp();
  const [shareProject, setShareProject] = useState<{ id: string; name: string; color: string } | null>(null);

  // Deep link: auto-open project from URL ?project=ID + set OG meta tags for preview
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) {
      const tryOpen = () => {
        const found = projects.find(p => p.id === projectId);
        if (found) {
          setSelectedProject(found);
          // Update OG meta tags so social previews show the project
          const title = found.name + ' — Ambassador Cre8tive Portfolio';
          const desc = found.description || 'Check out this project from Ambassador Cre8tive portfolio.';
          const previewImage = found.thumbnail || found.images?.[0] || 'https://placehold.co/1200x630/' + found.color.replace('#', '') + '/ffffff?text=' + encodeURIComponent(found.name);
          const shareUrl = window.location.origin + window.location.pathname + '?project=' + projectId;

          document.title = title;
          setMeta('og-title', 'content', title);
          setMeta('og-description', 'content', desc);
          setMeta('og-image', 'content', previewImage);
          setMeta('og-url', 'content', shareUrl);
          setMeta('tw-title', 'content', title);
          setMeta('tw-description', 'content', desc);
          setMeta('tw-image', 'content', previewImage);

          window.history.replaceState({}, '', window.location.pathname);
        }
      };
      tryOpen();
      const timer = setTimeout(tryOpen, 1500);
      return () => clearTimeout(timer);
    }
  }, [projects, setSelectedProject]);

  // Listen for custom share events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setShareProject(detail);
    };
    window.addEventListener('open-share-modal', handler);
    return () => window.removeEventListener('open-share-modal', handler);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <MainContent />
        </main>
      </div>
      <ProjectModal />
      {shareProject && (
        <ShareModal
          projectId={shareProject.id}
          projectName={shareProject.name}
          projectColor={shareProject.color}
          onClose={() => setShareProject(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
