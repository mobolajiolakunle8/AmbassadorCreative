import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Project, initialProjects } from '../data/projects';
import { AboutData, defaultAbout } from '../data/about';
import { SiteSettings, SocialLinks, defaultSettings } from '../data/settings';
import { ContactMessage } from '../data/messages';
import { CVData, defaultCV } from '../data/cv';
import { listenTo, writeTo, removeAt, updateAt } from '../firebase';

type ViewMode = 'grid' | 'list';
type Page = 'drive' | 'about' | 'contact' | 'admin' | 'category' | 'starred' | 'recent' | 'trash' | 'cv';
type SyncStatus = 'connecting' | 'synced' | 'offline';
type ThemeMode = 'light' | 'dark';

interface AppState {
  projects: Project[];
  about: AboutData;
  settings: SiteSettings;
  messages: ContactMessage[];
  cv: CVData;
  theme: ThemeMode;
  viewMode: ViewMode;
  searchQuery: string;
  currentPage: Page;
  selectedCategory: string | null;
  selectedProject: Project | null;
  sidebarOpen: boolean;
  isAuthenticated: boolean;
  syncStatus: SyncStatus;
}

interface AppContextType extends AppState {
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: Page) => void;
  setSelectedCategory: (cat: string | null) => void;
  setSelectedProject: (project: Project | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleStar: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveAbout: (about: AboutData) => Promise<void>;
  saveCV: (cv: CVData) => Promise<void>;
  saveSettings: (settings: SiteSettings) => Promise<void>;
  saveSocialLinks: (socialLinks: SocialLinks) => Promise<void>;
  changeAdminPassword: (newPassword: string) => Promise<void>;
  sendMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  toggleTheme: () => void;
  login: (password: string) => boolean;
  logout: () => void;
  getFilteredProjects: () => Project[];
  getProjectsByCategory: (categoryId: string) => Project[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('portfolio-theme') as ThemeMode) || 'light';
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    projects: initialProjects,
    about: defaultAbout,
    settings: defaultSettings,
    messages: [],
    cv: defaultCV,
    theme: getInitialTheme(),
    viewMode: 'grid',
    searchQuery: '',
    currentPage: 'drive',
    selectedCategory: null,
    selectedProject: null,
    sidebarOpen: false,
    isAuthenticated: false,
    syncStatus: 'connecting',
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('portfolio-theme', state.theme);
  }, [state.theme]);

  // === Firebase real-time sync ===
  useEffect(() => {
    let initialized = false;

    const unsubProjects = listenTo<Record<string, Project>>('projects', data => {
      if (data) {
        // Normalize: Firebase may convert arrays to objects, and strips empty arrays
        const projects: Project[] = Object.values(data).map(p => ({
          ...p,
          tools: Array.isArray(p.tools) ? p.tools : p.tools ? (Object.values(p.tools) as string[]) : [],
          images: Array.isArray(p.images) ? p.images : p.images ? (Object.values(p.images) as string[]) : [],
        }));
        setState(prev => ({ ...prev, projects, syncStatus: 'synced' }));
      } else if (!initialized) {
        // No data exists yet — seed initial projects
        const seed: Record<string, Project> = {};
        initialProjects.forEach(p => { seed[p.id] = p; });
        writeTo('projects', seed).catch(() => {});
        setState(prev => ({ ...prev, syncStatus: 'synced' }));
      }
      initialized = true;
    });

    const unsubAbout = listenTo<AboutData>('about', data => {
      if (data) {
        setState(prev => ({ ...prev, about: { ...defaultAbout, ...data } }));
      } else {
        writeTo('about', defaultAbout).catch(() => {});
      }
    });

    const unsubSettings = listenTo<SiteSettings>('settings', data => {
      if (data) {
        setState(prev => ({
          ...prev,
          settings: {
            ...defaultSettings,
            ...data,
            socialLinks: { ...defaultSettings.socialLinks, ...(data.socialLinks || {}) },
          },
        }));
      } else {
        writeTo('settings', defaultSettings).catch(() => {});
      }
    });

    const unsubMessages = listenTo<Record<string, ContactMessage>>('messages', data => {
      if (data) {
        const messages = Object.values(data).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setState(prev => ({ ...prev, messages }));
      }
    });

    const unsubCV = listenTo<CVData>('cv', data => {
      if (data) {
        setState(prev => ({ ...prev, cv: { ...defaultCV, ...data } }));
      } else {
        writeTo('cv', defaultCV).catch(() => {});
      }
    });

    return () => {
      unsubProjects();
      unsubAbout();
      unsubSettings();
      unsubMessages();
      unsubCV();
    };
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => setState(p => ({ ...p, viewMode: mode })), []);
  const setSearchQuery = useCallback((q: string) => setState(p => ({ ...p, searchQuery: q })), []);
  const setCurrentPage = useCallback((page: Page) =>
    setState(p => ({ ...p, currentPage: page, selectedProject: null, sidebarOpen: false })), []);
  const setSelectedCategory = useCallback((cat: string | null) =>
    setState(p => ({ ...p, selectedCategory: cat, currentPage: cat ? 'category' : 'drive', sidebarOpen: false })), []);
  const setSelectedProject = useCallback((project: Project | null) =>
    setState(p => ({ ...p, selectedProject: project })), []);
  const setSidebarOpen = useCallback((open: boolean) => setState(p => ({ ...p, sidebarOpen: open })), []);
  const toggleTheme = useCallback(() => setState(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' })), []);

  const toggleStar = useCallback(async (id: string) => {
    const project = state.projects.find(p => p.id === id);
    if (project) {
      await updateAt(`projects/${id}`, { starred: !project.starred });
    }
  }, [state.projects]);

  const addProject = useCallback(async (project: Project) => {
    await writeTo(`projects/${project.id}`, project);
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    await writeTo(`projects/${project.id}`, project);
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await removeAt(`projects/${id}`);
  }, []);

  const saveAbout = useCallback(async (about: AboutData) => {
    await writeTo('about', about);
  }, []);

  const saveCV = useCallback(async (cv: CVData) => {
    await writeTo('cv', cv);
  }, []);

  const saveSettings = useCallback(async (settings: SiteSettings) => {
    await writeTo('settings', settings);
  }, []);

  const saveSocialLinks = useCallback(async (socialLinks: SocialLinks) => {
    await updateAt('settings', { socialLinks });
  }, []);

  const changeAdminPassword = useCallback(async (newPassword: string) => {
    await updateAt('settings', { adminPassword: newPassword });
  }, []);

  const sendMessage = useCallback(async (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const id = Date.now().toString();
    const fullMsg: ContactMessage = {
      ...msg,
      id,
      date: new Date().toISOString(),
      read: false,
    };
    await writeTo(`messages/${id}`, fullMsg);
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    await removeAt(`messages/${id}`);
  }, []);

  const markMessageRead = useCallback(async (id: string) => {
    await updateAt(`messages/${id}`, { read: true });
  }, []);

  const login = useCallback((password: string) => {
    if (password === state.settings.adminPassword) {
      setState(p => ({ ...p, isAuthenticated: true, currentPage: 'admin' }));
      return true;
    }
    return false;
  }, [state.settings.adminPassword]);

  const logout = useCallback(() =>
    setState(p => ({ ...p, isAuthenticated: false, currentPage: 'drive' })), []);

  const getFilteredProjects = useCallback(() => {
    if (!state.searchQuery) return state.projects;
    const q = state.searchQuery.toLowerCase();
    return state.projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tools.some(t => t.toLowerCase().includes(q))
    );
  }, [state.projects, state.searchQuery]);

  const getProjectsByCategory = useCallback(
    (categoryId: string) => categoryId === 'all'
      ? state.projects
      : state.projects.filter(p => p.category === categoryId),
    [state.projects]
  );

  return (
    <AppContext.Provider value={{
      ...state,
      setViewMode, setSearchQuery, setCurrentPage, setSelectedCategory,
      setSelectedProject, setSidebarOpen, toggleStar, addProject, updateProject,
      deleteProject, saveAbout, saveCV, saveSettings, saveSocialLinks, changeAdminPassword,
      sendMessage, deleteMessage, markMessageRead, toggleTheme,
      login, logout, getFilteredProjects, getProjectsByCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
