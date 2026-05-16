import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  Camera,
  AtSign,
  Briefcase,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const socialUrl = (platform: string, value: string) => {
  if (!value.trim()) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '').trim();
  const bases: Record<string, string> = {
    instagram: 'https://instagram.com/',
    twitter: 'https://x.com/',
    linkedin: 'https://linkedin.com/in/',
    behance: 'https://behance.net/',
    dribbble: 'https://dribbble.com/',
    website: 'https://',
  };
  return `${bases[platform] || 'https://'}${handle}`;
};

// Use Web3Forms - free, reliable, no CORS issues
async function sendEmailViaWeb3Forms(emailTo: string, data: typeof initialFormData) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: 'a8e7c6d5-b4a3-2f1e-9d8c-7b6a5f4e3d2c',
      subject: `Portfolio Contact: ${data.subject}`,
      from_name: data.name,
      email: data.email,
      message: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
      to_email: emailTo,
    }),
  });

  const result = await response.json();
  if (!result.success) {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(`Portfolio: ${data.subject}`)}&body=${encodeURIComponent(
      `From: ${data.name} (${data.email})\n\n${data.message}`
    )}`;
    window.location.href = mailtoLink;
    throw new Error('Email service temporarily unavailable. Your email client has been opened as backup.');
  }
  return result;
}

const initialFormData = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const { settings, about, sendMessage } = useApp();
  const [formData, setFormData] = useState(initialFormData);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const whatsappNumber = settings.whatsapp.replace(/\D/g, '');
  const socials = [
    { icon: Camera, color: '#E1306C', label: 'Instagram', href: socialUrl('instagram', settings.socialLinks.instagram) },
    { icon: AtSign, color: '#1DA1F2', label: 'Twitter/X', href: socialUrl('twitter', settings.socialLinks.twitter) },
    { icon: Briefcase, color: '#0A66C2', label: 'LinkedIn', href: socialUrl('linkedin', settings.socialLinks.linkedin) },
    { icon: Briefcase, color: '#1769FF', label: 'Behance', href: socialUrl('behance', settings.socialLinks.behance) },
    { icon: AtSign, color: '#EA4C89', label: 'Dribbble', href: socialUrl('dribbble', settings.socialLinks.dribbble) },
    { icon: Globe, color: '#34A853', label: 'Website', href: socialUrl('website', settings.socialLinks.website) },
  ].filter(s => s.href);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      try {
        await sendEmailViaWeb3Forms(settings.email, formData);
      } catch (emailErr) {
        console.warn('Email failed, continuing with other notifications:', emailErr);
      }

      await sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      const waText = encodeURIComponent(
        `📩 New Portfolio Message\n\nFrom: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\n${formData.message}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank');

      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setFormData(initialFormData);
    } catch (err) {
      setError('Failed to send: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="text-gray-800 font-medium">Contact</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Get in Touch</h3>
            <p className="text-sm text-gray-500 mb-6">
              Have a project in mind? Let's create something amazing together.
            </p>

            <div className="space-y-4">
              <a href={`mailto:${settings.email}`} className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                  <Mail size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors break-all">
                    {settings.email}
                  </p>
                </div>
              </a>

              <a href={`tel:${settings.phone}`} className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <Phone size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tel / WhatsApp</p>
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                    {settings.phone}
                  </p>
                </div>
              </a>

              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <MessageCircle size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp Direct</p>
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Chat with me</p>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm text-gray-700">{about.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Follow Me</h4>
            <div className="flex gap-2">
              {socials.length === 0 ? (
                <p className="text-xs text-gray-400">Social handles will appear here once added.</p>
              ) : socials.map(social => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors" title={social.label}>
                  <social.icon size={18} style={{ color: social.color }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Send a Message</h3>
          <p className="text-sm text-gray-400 mb-6">Fill out the form below and I'll get back to you shortly.</p>

          {sent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ Message sent! Saved to dashboard and WhatsApp notification sent. I'll reply soon.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
              <input type="text" required value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" placeholder="Project inquiry" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
              <textarea required rows={5} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all resize-none" placeholder="Tell me about your project..." />
            </div>
            <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
              {sending ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>) : (<><Send size={16} />Send Message</>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}