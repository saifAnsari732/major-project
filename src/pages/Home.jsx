import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Home.css';
import {
  GraduationCap, Monitor, FileText, Microscope,
  BookOpen, Briefcase, TrendingUp, Building,
  Sparkles, ArrowRight
} from 'lucide-react';

const courseIcons = {
  'B Tech': GraduationCap, 'MCA': Monitor, 'Diploma': FileText,
  'BSC': Microscope, 'MSC': BookOpen, 'BCA': Monitor,
  'MBA': Briefcase, 'BBA': TrendingUp
};

const courseColors = {
  'B.Tech': 'from-blue-500 to-blue-600', 'MCA': 'from-cyan-500 to-cyan-600',
  'Diploma': 'from-teal-500 to-teal-600', 'BSC': 'from-sky-500 to-sky-600',
  'MSC': 'from-orange-400 to-orange-500', 'BCA': 'from-emerald-500 to-emerald-600',
  'MBA': 'from-purple-400 to-purple-500', 'BBA': 'from-rose-400 to-rose-500'
};

// Courses that skip branch selection -> go directly to their papers page
const DIRECT_TO_PAPERS = ['BCA', 'MCA'];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch { toast.error('Failed to fetch courses'); }
    finally { setLoading(false); }
  };

  // if (loading) return (
  //   <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
  //     <div className="text-center">
  //       <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-cyan-400 mx-auto mb-6" />
  //       <p className="text-blue-300 text-lg font-semibold">Loading amazing content...</p>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-blue-900">
      {/* Hero */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-40 -right-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
        </div>
        <style>{`
          @keyframes blob {
            0%,100%{transform:translate(0,0) scale(1);}
            33%{transform:translate(30px,-50px) scale(1.1);}
            66%{transform:translate(-20px,20px) scale(0.9);}
          }
          .animate-blob{animation:blob 7s infinite;}
          .animation-delay-2000{animation-delay:2s;}
          .animation-delay-4000{animation-delay:4s;}
        `}</style>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-block">
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-700/60 to-cyan-700/60 border border-blue-500/60 rounded-full px-6 py-2 backdrop-blur-md hover:border-cyan-400/80 transition-colors cursor-pointer">
              <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
              <span className="text-sm font-semibold text-cyan-200">Start Coding Now - Join thousands of learners</span>
            </div>
          </div>
          <h1 className="text-5xl flex flex-col md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <div className="items-center justify-center flex-col md:flex-row flex">
              <span className="text-cyan-300 mb-2">Learn <span className="text-gray-100">Build</span></span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 animate-gradient">Succeed</span>
            </div>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mt-4 text-5xl md:text-6xl">with code4You</span>
          </h1>
          <p className="md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
            Transform your coding skills with hands-on learning, real-world projects, and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 overflow-hidden text-lg">
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Link to="/code-compiler">Start Codding Free</Link>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <Link to="/calculator" className="px-8 py-4 border-2 border-cyan-400 text-cyan-300 font-bold rounded-xl hover:bg-blue-900/50 transition-all duration-300 hover:scale-105 text-lg">
              Explore Calculator <ArrowRight className="h-5 ml-2 inline-flex w-5 transition-transform" />
            </Link>
          </div>
          <div className="stats-grid">
            <div className="stat-card-hero"><div className="stat-emoji">🎓</div><p className="stat-number">500+</p><p className="stat-label">Awesome Courses</p></div>
            <div className="stat-card-hero"><div className="stat-emoji">👨‍💻</div><p className="stat-number">50K+</p><p className="stat-label">Happy Learners</p></div>
            <div className="stat-card-hero"><div className="stat-emoji">🚀</div><p className="stat-number">95%</p><p className="stat-label">Success Rate</p></div>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="courses-section">
        <div className="max-w-7xl mx-auto">
          <div className="courses-header">
            <h2 className="courses-title">Popular Courses</h2>
            <p className="courses-subtitle">Choose from our extensive library of programming and technology courses</p>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <Building className="empty-state-icon" />
              <p className="empty-state-title">No courses available yet</p>
              <p className="empty-state-subtitle">Check back soon!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => {
                const Icon = courseIcons[course.name] || GraduationCap;
                const colorClass = courseColors[course.name] || 'from-purple-500 to-cyan-500';
                const isDirectPapers = DIRECT_TO_PAPERS.includes(course.name);
                return (
                  <div key={course._id} className="course-card">
                    <div className={`course-gradient-bar !bg-gradient-to-r ${colorClass}`} />
                    <div className="course-card-overlay" />
                    <div className="course-card-content">
                      <div className={`course-icon-box !bg-gradient-to-br ${colorClass}`}>
                        <Icon className="course-icon" />
                      </div>
                      <div>
                        <h3 className="course-card-title">{course.name}</h3>
                        <p className="course-card-subtitle">
                          {isDirectPapers ? 'Browse previous year papers' : 'Master this in-demand course'}
                        </p>
                      </div>
                      {isDirectPapers ? (
                        /* BCA / MCA → dedicated CoursePapers page */
                        <Link to={`/course/${course._id}/papers`} className="course-card-button">
                          <span>View Papers</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        /* Other courses → branch selection */
                        <Link to={`/course/${course._id}/branches`} className="course-card-button">
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-card">
          <div className="cta-emoji">⚡</div>
          <h2 className="cta-title">Ready to Code Like a Pro?</h2>
          <p className="cta-description">Join 50K+ learners building amazing projects and landing dream jobs</p>
          <Link to="/code-compiler" className="cta-button">🚀 Start Code Today</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-section">
        <div className="max-w-7xl mx-auto">
          <div className="footer-grid">
            <div><h4 className="footer-column-title">Product</h4><ul><li><a href="#" className="footer-link">Courses</a></li><li><a href="#" className="footer-link">Pricing</a></li><li><a href="#" className="footer-link">Features</a></li></ul></div>
            <div><h4 className="footer-column-title">Learn</h4><ul><li><a href="#" className="footer-link">Blog</a></li><li><a href="#" className="footer-link">Docs</a></li><li><a href="#" className="footer-link">FAQ</a></li></ul></div>
            <div><h4 className="footer-column-title">Company</h4><ul><li><a href="#" className="footer-link">About</a></li><li><a href="#" className="footer-link">Contact</a></li><li><a href="#" className="footer-link">Careers</a></li></ul></div>
            <div><h4 className="footer-column-title">Legal</h4><ul><li><a href="#" className="footer-link">Privacy</a></li><li><a href="#" className="footer-link">Terms</a></li><li><a href="#" className="footer-link">License</a></li></ul></div>
          </div>
          <div className="border-t border-blue-700 pt-8 text-center text-blue-300">
            <p>&copy; 2026 code4You. All rights reserved. Crafted with <span className="text-pink-400">❤</span> for learners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;