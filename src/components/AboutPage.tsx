import { Palette, Award, Users, Calendar, MapPin, GraduationCap, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { about } = useApp();
  const initials = about.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="text-gray-800 font-medium">About Me</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="px-4 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg">
              {about.websiteDp ? (
                <img
                  src={about.websiteDp}
                  alt={about.name}
                  className="w-full h-full rounded-xl object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="pt-2 sm:pt-16">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{about.name}</h1>
              <p className="text-gray-500 mt-1">{about.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={14} />{about.location}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={14} />{about.experience}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><GraduationCap size={14} />{about.availability}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Palette, label: 'Projects', value: about.stats.projects, color: '#4285F4' },
          { icon: Users, label: 'Happy Clients', value: about.stats.clients, color: '#EA4335' },
          { icon: Award, label: 'Awards', value: about.stats.awards, color: '#FBBC04' },
          { icon: Calendar, label: 'Years Active', value: about.stats.years, color: '#34A853' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <stat.icon size={24} style={{ color: stat.color }} className="mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" />About Me
          </h3>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            {about.bio.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Palette size={20} className="text-blue-500" />Skills & Expertise
          </h3>
          <div className="space-y-3">
            {about.skills.map(item => (
              <div key={item.skill}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">{item.skill}</span>
                  <span className="text-gray-400">{item.level}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${item.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-500" />Tools I Use
          </h3>
          <div className="flex flex-wrap gap-3">
            {about.tools.map(tool => (
              <span key={tool} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
