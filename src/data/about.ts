export interface SkillItem {
  skill: string;
  level: number;
}

export interface AboutData {
  name: string;
  title: string;
  websiteDp?: string;
  location: string;
  experience: string;
  availability: string;
  bio: string[];
  skills: SkillItem[];
  tools: string[];
  stats: {
    projects: string;
    clients: string;
    awards: string;
    years: string;
  };
}

export const defaultAbout: AboutData = {
  name: 'Mobolaji Olakunle',
  title: 'Graphic Designer & Visual Storyteller',
  websiteDp: '',
  location: 'Lagos, Nigeria',
  experience: '5+ Years Experience',
  availability: 'Available for Freelance',
  bio: [
    "I'm a passionate graphic designer based in Lagos, Nigeria, with over 5 years of experience creating compelling visual identities and design solutions for brands across Africa and beyond.",
    'My work spans branding, logo design, print media, digital marketing collateral, and creative collaborations. I believe in the power of design to tell stories, build connections, and drive business growth.',
    'Every project I take on is an opportunity to push creative boundaries while delivering practical, impactful results that resonate with target audiences.',
  ],
  skills: [
    { skill: 'Brand Identity Design', level: 95 },
    { skill: 'Logo Design', level: 90 },
    { skill: 'Print Design', level: 88 },
    { skill: 'Digital Marketing Design', level: 85 },
    { skill: 'Packaging Design', level: 80 },
    { skill: 'UI/UX Design', level: 70 },
  ],
  tools: [
    'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign',
    'Figma', 'CorelDRAW', 'Procreate', 'Adobe After Effects',
    'Lightroom', 'Sketch', 'Canva',
  ],
  stats: {
    projects: '50+',
    clients: '30+',
    awards: '5',
    years: '5+',
  },
};
