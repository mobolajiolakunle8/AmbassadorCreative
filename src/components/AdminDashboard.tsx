import { useApp } from '../context/AppContext';
import { categories, Project } from '../data/projects';
import { AboutData } from '../data/about';
import { SiteSettings } from '../data/settings';
import { compressImageToBase64, formatBytes } from '../firebase';
import {
  Lock, LogOut, Plus, Edit3, Trash2, Save, X, Star, FileImage,
  BarChart3, FolderOpen, Search, Upload, ImagePlus, User, FolderKanban,
  Settings as SettingsIcon, KeyRound, HardDrive, MessageSquare, Mail,
} from 'lucide-react';
import { useState, useRef } from 'react';

function LoginForm({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(password)) setError('Incorrect password. Please use your current admin password.');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Ambassador Cre8tive</h2>
        <p className="text-sm text-gray-400 mb-6">Sign in to manage your portfolio</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </form>
        <p className="text-xs text-gray-300 mt-4">Secure portfolio management</p>
      </div>
    </div>
  );
}

// === Project Editor with Image Upload ===
function ProjectForm({
  project, onSave, onCancel,
}: {
  project?: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Project>(
    project || {
      id: Date.now().toString(),
      name: '', category: 'branding', type: 'file', thumbnail: '',
      images: [], description: '', tools: [''],
      date: new Date().toISOString().split('T')[0],
      size: '0 MB', starred: false, color: '#4285F4',
    }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [compressionLog, setCompressionLog] = useState<
    Array<{ name: string; original: number; compressed: number; saved: number }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolChange = (i: number, v: string) => {
    const t = [...form.tools]; t[i] = v;
    setForm(p => ({ ...p, tools: t }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    const newImages: string[] = [];
    const newLog: Array<{ name: string; original: number; compressed: number; saved: number }> = [];
    let totalOriginal = 0;
    let totalCompressed = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });
        try {
          const result = await compressImageToBase64(file);
          newImages.push(result.dataUrl);
          totalOriginal += result.originalBytes;
          totalCompressed += result.compressedBytes;
          newLog.push({
            name: file.name,
            original: result.originalBytes,
            compressed: result.compressedBytes,
            saved: Math.max(0, result.originalBytes - result.compressedBytes),
          });
        } catch (err) {
          alert(`"${file.name}" failed: ${(err as Error).message}`);
        }
      }
      if (newImages.length) {
        setForm(p => ({
          ...p,
          images: [...(p.images || []), ...newImages],
          thumbnail: p.thumbnail || newImages[0],
          size: formatBytes(totalCompressed),
        }));
      }
      setCompressionLog(prev => [...newLog, ...prev].slice(0, 8));
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (i: number) => {
    setForm(p => {
      const imgs = (p.images || []).filter((_, idx) => idx !== i);
      return { ...p, images: imgs, thumbnail: p.thumbnail === p.images[i] ? (imgs[0] || '') : p.thumbnail };
    });
  };

  const setAsThumbnail = (img: string) => setForm(p => ({ ...p, thumbnail: img }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find(c => c.id === form.category);
    onSave({
      ...form,
      color: cat?.color || '#4285F4',
      tools: form.tools.filter(t => t.trim()),
      images: form.images || [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-gray-800">{project ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload Section */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Project Images</label>

            {form.images && form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {form.thumbnail === img && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {form.thumbnail !== img && (
                        <button type="button" onClick={() => setAsThumbnail(img)}
                          className="text-[10px] bg-white/90 px-2 py-1 rounded text-gray-700 font-medium hover:bg-white">
                          Set Cover
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(i)}
                        className="p-1 bg-red-500 rounded text-white hover:bg-red-600">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>
                      Compressing image {uploadProgress?.current ?? 0} of {uploadProgress?.total ?? 0}…
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">Original pixel dimensions are preserved</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ImagePlus size={20} className="text-blue-500" />
                    <span>Click to upload images</span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Auto-compressed to manage storage · No resizing · Target ≤ 600 KB each
                  </span>
                </>
              )}
            </label>

            {compressionLog.length > 0 && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Compression report
                  </p>
                  <button
                    type="button"
                    onClick={() => setCompressionLog([])}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800"
                  >
                    Clear
                  </button>
                </div>
                <ul className="space-y-1 max-h-28 overflow-y-auto">
                  {compressionLog.map((entry, idx) => {
                    const pct = entry.original > 0
                      ? Math.round((entry.saved / entry.original) * 100)
                      : 0;
                    return (
                      <li key={idx} className="flex items-center justify-between gap-2 text-[11px] text-gray-600">
                        <span className="truncate flex-1">{entry.name}</span>
                        <span className="text-gray-400">
                          {formatBytes(entry.original)} → {formatBytes(entry.compressed)}
                        </span>
                        <span className="text-emerald-600 font-medium w-12 text-right">−{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Project Name</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              placeholder="My Amazing Project" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
              <select value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea required rows={4} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none"
              placeholder="Describe the project..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tools Used</label>
            {form.tools.map((tool, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={tool} onChange={e => handleToolChange(i, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  placeholder="e.g., Adobe Photoshop" />
                {form.tools.length > 1 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, tools: p.tools.filter((_, idx) => idx !== i) }))}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm(p => ({ ...p, tools: [...p.tools, ''] }))}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Tool</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">File Size</label>
              <input type="text" value={form.size}
                onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                placeholder="e.g., 12.5 MB" />
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.starred}
                onChange={e => setForm(p => ({ ...p, starred: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-gray-700">Starred</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={uploading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={16} /> {project ? 'Update & Sync' : 'Create & Sync'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// === About Editor ===
function AboutEditor() {
  const { about, saveAbout } = useApp();
  const [form, setForm] = useState<AboutData>(about);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dpUploading, setDpUploading] = useState(false);
  const [dpCompression, setDpCompression] = useState<{ original: number; compressed: number } | null>(null);

  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleWebsiteDpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDpUploading(true);
    try {
      const result = await compressImageToBase64(file, 500 * 1024);
      setForm(p => ({ ...p, websiteDp: result.dataUrl }));
      setDpCompression({ original: result.originalBytes, compressed: result.compressedBytes });
    } catch (err) {
      alert('Website DP upload failed: ' + (err as Error).message);
    } finally {
      setDpUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAbout(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Save failed: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-sm flex-shrink-0">
          {form.websiteDp ? (
            <img
              src={form.websiteDp}
              alt="Website DP preview"
              className="w-full h-full rounded-xl object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials || 'DP'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800">Website DP</h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload the profile image used in the sidebar, top bar, and About page. The image is compressed only; it is not resized.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleWebsiteDpUpload}
                disabled={dpUploading}
                className="hidden"
              />
              {dpUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <ImagePlus size={16} />
                  Upload DP
                </>
              )}
            </label>
            {form.websiteDp && (
              <button
                type="button"
                onClick={() => { setForm(p => ({ ...p, websiteDp: '' })); setDpCompression(null); }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-white transition-colors"
              >
                Remove DP
              </button>
            )}
          </div>
          {dpCompression && (
            <p className="text-xs text-emerald-600 mt-2">
              Compressed from {formatBytes(dpCompression.original)} to {formatBytes(dpCompression.compressed)} without resizing.
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
          <input type="text" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Title / Role</label>
          <input type="text" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
          <input type="text" value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Experience</label>
          <input type="text" value={form.experience}
            onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['projects', 'clients', 'awards', 'years'] as const).map(k => (
          <div key={k}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 capitalize">{k}</label>
            <input type="text" value={form.stats[k]}
              onChange={e => setForm(p => ({ ...p, stats: { ...p.stats, [k]: e.target.value } }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio (one paragraph per line)</label>
        <textarea rows={6} value={form.bio.join('\n\n')}
          onChange={e => setForm(p => ({ ...p, bio: e.target.value.split('\n\n').filter(Boolean) }))}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none" />
        <p className="text-xs text-gray-400 mt-1">Separate paragraphs with a blank line.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Skills</label>
        {form.skills.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={s.skill}
              onChange={e => {
                const skills = [...form.skills];
                skills[i] = { ...skills[i], skill: e.target.value };
                setForm(p => ({ ...p, skills }));
              }}
              placeholder="Skill name"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:outline-none" />
            <input type="number" min={0} max={100} value={s.level}
              onChange={e => {
                const skills = [...form.skills];
                skills[i] = { ...skills[i], level: parseInt(e.target.value) || 0 };
                setForm(p => ({ ...p, skills }));
              }}
              className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:outline-none" />
            <button type="button"
              onClick={() => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
              <X size={16} />
            </button>
          </div>
        ))}
        <button type="button"
          onClick={() => setForm(p => ({ ...p, skills: [...p.skills, { skill: '', level: 50 }] }))}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Skill</button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Tools (comma-separated)</label>
        <textarea rows={2} value={form.tools.join(', ')}
          onChange={e => setForm(p => ({ ...p, tools: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          ) : (
            <><Save size={16} />Save & Sync</>
          )}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Saved to all browsers</span>}
      </div>
    </div>
  );
}

function SettingsEditor() {
  const { settings, saveSettings, changeAdminPassword } = useApp();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const saveHandles = async () => {
    setSaving(true);
    try {
      await saveSettings({ ...form, adminPassword: settings.adminPassword });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (e) {
      alert('Settings save failed: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwordForm.current !== settings.adminPassword) {
      alert('Current password is incorrect.');
      return;
    }
    if (passwordForm.next.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      alert('New password and confirmation do not match.');
      return;
    }
    try {
      await changeAdminPassword(passwordForm.next);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (e) {
      alert('Password update failed: ' + (e as Error).message);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon size={18} className="text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Contact & Social Handles</h3>
        </div>

        {(['email', 'phone', 'whatsapp'] as const).map(key => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 capitalize">{key}</label>
            <input
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
        ))}

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {(Object.keys(form.socialLinks) as Array<keyof SiteSettings['socialLinks']>).map(key => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 capitalize">{key}</label>
              <input
                type="text"
                value={form.socialLinks[key]}
                onChange={e => setForm(p => ({
                  ...p,
                  socialLinks: { ...p.socialLinks, [key]: e.target.value },
                }))}
                placeholder={`@${key} or full URL`}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={saveHandles} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Save size={16} />Save Handles
          </button>
          {settingsSaved && <span className="text-sm text-green-600">Saved and synced</span>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Change Admin Password</h3>
        </div>
        <p className="text-sm text-gray-500">This updates the login password across browsers through Firebase sync.</p>

        {[
          { key: 'current', label: 'Current Password' },
          { key: 'next', label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(item => (
          <div key={item.key}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{item.label}</label>
            <input
              type="password"
              value={passwordForm[item.key as keyof typeof passwordForm]}
              onChange={e => setPasswordForm(p => ({ ...p, [item.key]: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={updatePassword}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            <KeyRound size={16} />Update Password
          </button>
          {passwordSaved && <span className="text-sm text-green-600">Password updated</span>}
        </div>
      </div>
    </div>
  );
}

// === Messages Viewer ===
function MessagesViewer() {
  const { messages, deleteMessage, markMessageRead } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Inbox</h3>
          <p className="text-sm text-gray-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''} · {unreadCount} unread
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No messages yet</p>
          <p className="text-gray-300 text-xs mt-1">Messages from the contact form will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border transition-all ${
                  msg.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                {/* Message header */}
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg.id);
                    if (!msg.read) markMessageRead(msg.id);
                  }}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    msg.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {msg.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${msg.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{msg.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(msg.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <Mail size={14} className={msg.read ? 'text-gray-300' : 'text-blue-500'} />
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-xs text-gray-400">From</span>
                        <p className="text-sm text-gray-700">{msg.name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Email</span>
                        <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline block truncate">
                          {msg.email}
                        </a>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-400">Subject</span>
                      <p className="text-sm text-gray-700 font-medium">{msg.subject}</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs text-gray-400">Message</span>
                      <p className="text-sm text-gray-600 leading-relaxed mt-1 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Mail size={12} /> Reply via Email
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this message?')) deleteMessage(msg.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Main Admin Dashboard ===
export default function AdminDashboard() {
  const {
    isAuthenticated, login, logout, projects, messages,
    addProject, updateProject, deleteProject, setCurrentPage,
  } = useApp();

  const [tab, setTab] = useState<'projects' | 'about' | 'settings' | 'messages'>('projects');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) return <LoginForm onLogin={login} />;

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryStats = categories.map(cat => ({
    ...cat,
    count: projects.filter(p => p.category === cat.id).length,
  }));

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-sm text-gray-400">Changes sync to all visitors in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage('drive')}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            View Portfolio
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </div>

      {/* Quick Actions + Upload */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Upload Project Card */}
        <button
          onClick={() => { setEditingProject(undefined); setShowForm(true); }}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Plus size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Upload Project</p>
            <p className="text-xs text-gray-400">Add a new design to your portfolio</p>
          </div>
        </button>

        {/* Portfolio Storage Card */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <HardDrive size={24} className="text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 mb-1">Portfolio Storage</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (projects.reduce((acc, p) => {
                        const images = p.images || [];
                        return acc + images.reduce((imgAcc, img) => {
                          // Base64 images: ~3 bytes per 4 characters
                          return imgAcc + (img.length * 3) / 4;
                        }, 0);
                      }, 0) /
                        (15 * 1024 * 1024 * 1024)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {formatBytes(
                projects.reduce((acc, p) => {
                  const images = p.images || [];
                  return acc + images.reduce((imgAcc, img) => imgAcc + (img.length * 3) / 4, 0);
                }, 0),
              )}{' '}
              of 15 GB used · {projects.length} projects ·{' '}
              {projects.reduce((acc, p) => acc + (p.images || []).length, 0)} images
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button onClick={() => setTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'projects' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <FolderKanban size={16} /> Projects
        </button>
        <button onClick={() => setTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'about' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <User size={16} /> About Page
        </button>
        <button onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'settings' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <SettingsIcon size={16} /> Settings
        </button>
        <button onClick={() => setTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
            tab === 'messages' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <MessageSquare size={16} /> Messages
          {messages.filter(m => !m.read).length > 0 && (
            <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {messages.filter(m => !m.read).length}
            </span>
          )}
        </button>
      </div>

      {tab === 'about' ? <AboutEditor /> : tab === 'settings' ? <SettingsEditor /> : tab === 'messages' ? <MessagesViewer /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <BarChart3 size={20} className="text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
              <p className="text-xs text-gray-400">Total Projects</p>
            </div>
            {categoryStats.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <FolderOpen size={20} style={{ color: cat.color }} className="mb-2" />
                <p className="text-2xl font-bold text-gray-800">{cat.count}</p>
                <p className="text-xs text-gray-400 truncate">{cat.name}</p>
              </div>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none" />
            </div>
            <button onClick={() => { setEditingProject(undefined); setShowForm(true); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
              <Plus size={18} />New Project
            </button>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Images</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: project.color + '15' }}>
                              <FileImage size={16} style={{ color: project.color }} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{project.name}</p>
                            <p className="text-xs text-gray-400">{project.size}</p>
                          </div>
                          {project.starred && <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{ backgroundColor: project.color + '15', color: project.color }}>
                          {project.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Upload size={12} />{(project.images || []).length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{project.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditingProject(project); setShowForm(true); }}
                            className="p-1.5 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Edit3 size={16} className="text-blue-500" />
                          </button>
                          <button onClick={() => {
                            if (window.confirm(`Delete "${project.name}"?`)) deleteProject(project.id);
                          }} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FileImage size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">No projects found</p>
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={async project => {
            try {
              if (editingProject) await updateProject(project);
              else await addProject(project);
              setShowForm(false);
            } catch (e) {
              alert('Save failed: ' + (e as Error).message);
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
