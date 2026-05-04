export interface SocialLinks {
  instagram: string;
  twitter: string;
  linkedin: string;
  behance: string;
  dribbble: string;
  website: string;
}

export interface SiteSettings {
  adminPassword: string;
  email: string;
  phone: string;
  whatsapp: string;
  socialLinks: SocialLinks;
}

export const defaultSettings: SiteSettings = {
  adminPassword: 'admin123',
  email: 'mobolajiolakunle@gmail.com',
  phone: '+2349030192034',
  whatsapp: '+2349030192034',
  socialLinks: {
    instagram: '',
    twitter: '',
    linkedin: '',
    behance: '',
    dribbble: '',
    website: '',
  },
};