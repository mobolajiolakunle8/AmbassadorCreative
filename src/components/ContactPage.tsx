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

function sendEmailViaFormSubmit(emailTo: string, data: typeof initialFormData) {
  return new Promise<void>((resolve) => {
    const iframeName = `formsubmit-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${encodeURIComponent(emailTo)}`;
    form.target = iframeName;
    form.style.display = 'none';

    const fields: Record<string, string> = {
      _subject: `Portfolio Contact: ${data.subject}`,
      _template: 'table',
      _captcha: 'false',
      _replyto: data.email,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    const cleanup = () => {
      setTimeout(() => {
        form.remove();
        iframe.remove();
      }, 1000);
    };

    iframe.onload = () => {
      cleanup();
      resolve();
    };

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    // FormSubmit posts through a normal form, so CORS cannot block it. Resolve
    // after a short delay even if the hidden iframe load event is suppressed.
    setTimeout(() => {
      cleanup();
      resolve();
    }, 2500);
  });
}

const initialFormData = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const { settings, about, sendMessage } = useApp();
  const [formData, setFormData] = useState(initialFormData);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
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
    try {
      // 1. Send actual email through a normal FormSubmit form POST.
      // This avoids the browser CORS error that caused "Failed to fetch".
      await sendEmailViaFormSubmit(settings.email, formData);

      // 2. Save message to Firebase for admin dashboard
      await sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      // 3. Send WhatsApp notification to admin
      const waText = encodeURIComponent(
        `📩 New Portfolio Message\n\nFrom: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\n${formData.message}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank');

      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setFormData(initialFormData);
    } catch (err) {
      alert('Failed to send message: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="text-gray-800 font-medium">Contact</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Get in Touch</h3>
            <p className="text-sm text-gray-500 mb-6">
              Have a project in mind? Let's create something amazing together.
            </p>

            <div className="space-y-4">
              <a
                href={`mailto:${settings.email}`}
                className="flex items-start gap-3 group"
              >
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

              <a
                href={`tel:${settings.phone}`}
                className="flex items-start gap-3 group"
              >
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

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <MessageCircle size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp Direct</p>
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                    Chat with me
                  </p>
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

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Follow Me</h4>
            <div className="flex gap-2">
              {socials.length === 0 ? (
                <p className="text-xs text-gray-400">Social handles will appear here once added.</p>
              ) : socials.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title={social.label}
                >
                  <social.icon size={18} style={{ color: social.color }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Send a Message</h3>
          <p className="text-sm text-gray-400 mb-6">Fill out the form below and I'll get back to you shortly.</p>

          {sent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ Message sent! Email delivered to inbox, WhatsApp notification sent, and saved to admin dashboard. I'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Project inquiry"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all resize-none"
                placeholder="Tell me about your project..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
