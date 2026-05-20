export interface CVExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface CVEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  details: string;
}

export interface CVSkill {
  category: string;
  items: string[];
}

export interface CVData {
  summary: string;
  cvPhoto: string;
  cvCover: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: CVSkill[];
  certifications: string[];
  languages: string[];
  references: string;
}

export const defaultCV: CVData = {
  summary: 'Creative and detail-oriented Graphic Designer with 5+ years of experience delivering exceptional visual solutions for diverse clients. Proficient in brand identity, print design, digital marketing collateral, and creative collaborations. Passionate about transforming ideas into compelling visual narratives that drive engagement and business growth.',
  cvPhoto: '',
  cvCover: '',
  experience: [
    {
      id: 'exp1',
      role: 'Senior Graphic Designer',
      company: 'Creative Studios Lagos',
      location: 'Lagos, Nigeria',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description: [
        'Lead designer for branding and identity projects for 20+ clients',
        'Managed design team of 3 junior designers',
        'Increased client satisfaction rate by 40% through improved design processes',
      ],
    },
    {
      id: 'exp2',
      role: 'Graphic Designer',
      company: 'Digital Marketing Agency',
      location: 'Lagos, Nigeria',
      startDate: '2020-03',
      endDate: '2021-12',
      current: false,
      description: [
        'Created digital marketing collateral for social media campaigns',
        'Designed print materials including brochures, flyers, and banners',
        'Collaborated with marketing team to develop brand guidelines',
      ],
    },
  ],
  education: [
    {
      id: 'edu1',
      degree: 'B.Sc. Graphic Design',
      institution: 'University of Lagos',
      location: 'Lagos, Nigeria',
      year: '2019',
      details: 'Second Class Upper Division',
    },
  ],
  skills: [
    {
      category: 'Design Software',
      items: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Figma', 'CorelDRAW', 'Procreate'],
    },
    {
      category: 'Specializations',
      items: ['Brand Identity', 'Logo Design', 'Print Design', 'Packaging Design', 'Digital Marketing Design'],
    },
  ],
  certifications: [
    'Adobe Certified Professional - Illustrator',
    'Google UX Design Certificate',
    'Brand Identity Design Specialization - Coursera',
  ],
  languages: ['English (Fluent)', 'Yoruba (Native)', 'Pidgin (Native)'],
  references: 'Available upon request',
};
