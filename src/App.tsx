import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FileGrid from './components/FileGrid';
import ProjectModal from './components/ProjectModal';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';

function MainContent() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <FileGrid />;
  }
}

function Layout() {
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
