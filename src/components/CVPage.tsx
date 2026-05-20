import { useApp } from '../context/AppContext';
import { Briefcase, GraduationCap, Award, Languages, FileText, Mail, Phone, MapPin } from 'lucide-react';

export default function CVPage() {
  const { cv, about } = useApp();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const initials = about.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="text-gray-800 font-medium">Curriculum Vitae</span>
      </div>

      {/* CV Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 sm:h-40 relative overflow-hidden">
          {cv.cvCover ? (
            <img src={cv.cvCover} alt="Cover" className="w-full h-full object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          )}
        </div>
        <div className="px-4 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg">
              {cv.cvPhoto ? (
                <img src={cv.cvPhoto} alt={about.name} className="w-full h-full rounded-xl object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
              ) : about.websiteDp ? (
                <img src={about.websiteDp} alt={about.name} className="w-full h-full rounded-xl object-cover" draggable={false} onContextMenu={e => e.preventDefault()} />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="pt-2 sm:pt-16 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{about.name}</h1>
              <p className="text-gray-500 mt-1">{about.title}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Mail size={14} />{about.name.toLowerCase().replace(' ', '.')}@gmail.com</span>
                <span className="flex items-center gap-1.5"><Phone size={14} />+234 903 019 2034</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} />{about.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={20} className="text-blue-500" />
          Professional Summary
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{cv.summary}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experience */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-500" />
              Work Experience
            </h2>
            <div className="space-y-5">
              {cv.experience.map(exp => (
                <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{exp.role}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{exp.location}</p>
                  <ul className="space-y-1">
                    {exp.description.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-500" />
              Education
            </h2>
            <div className="space-y-4">
              {cv.education.map(edu => (
                <div key={edu.id} className="border-l-2 border-purple-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <h3 className="text-sm font-semibold text-gray-800">{edu.degree}</h3>
                    <span className="text-xs text-gray-400">{edu.year}</span>
                  </div>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-400">{edu.location} · {edu.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award size={20} className="text-blue-500" />
              Skills
            </h2>
            <div className="space-y-4">
              {cv.skills.map((skillGroup, i) => (
                <div key={i}>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map(item => (
                      <span key={item} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-700 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {cv.certifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award size={20} className="text-yellow-500" />
                Certifications
              </h2>
              <ul className="space-y-2">
                {cv.certifications.map((cert, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">★</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {cv.languages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Languages size={20} className="text-green-500" />
                Languages
              </h2>
              <ul className="space-y-2">
                {cv.languages.map((lang, i) => (
                  <li key={i} className="text-sm text-gray-600">{lang}</li>
                ))}
              </ul>
            </div>
          )}

          {/* References */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText size={20} className="text-gray-400" />
              References
            </h2>
            <p className="text-sm text-gray-500">{cv.references}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
