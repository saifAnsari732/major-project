import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Monitor,
  FileText,
  Microscope,
  BookOpen,
  Briefcase,
  TrendingUp,
  Building,
  Sparkles,
  ArrowRight,
  Users,
  Zap,
  Target,
  Rocket
} from 'lucide-react';

const courseIcons = {
  'B Tech': GraduationCap,
  'MCA': Monitor,
  'Diploma': FileText,
  'BSC': Microscope,
  'MSC': BookOpen,
  'BCA': Monitor,
  'MBA': Briefcase,
  'BBA': TrendingUp
};

const courseColors = {
  'B.Tech': 'from-blue-500 to-blue-600',
  'MCA': 'from-cyan-500 to-cyan-600',
  'Diploma': 'from-teal-500 to-teal-600',
  'BSC': 'from-sky-500 to-sky-600',
  'MSC': 'from-orange-400 to-orange-500',
  'BCA': 'from-emerald-500 to-emerald-600',
  'MBA': 'from-purple-400 to-purple-500',
  'BBA': 'from-rose-400 to-rose-500'
};

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-blue-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-cyan-400 mx-auto mb-6"></div>
            <p className="text-blue-300 text-lg font-semibold">Loading amazing content...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-blue-900">
      {/* <Navbar /> */}

      {/* Hero Section - Full Screen */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">
          <div className="mb-8 inline-block">
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-700/60 to-cyan-700/60 border border-blue-500/60 rounded-full px-6 py-2 backdrop-blur-md hover:border-cyan-400/80 transition-colors cursor-pointer">
              <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
              <span className="text-sm font-semibold text-cyan-200">✨ Start Coding Now - Join thousands of learners</span>
            </div>
          </div>

          <h1 className="text-5xl flex flex-col md:text-7xl lg:text-8xl font-black mb-8 leading-tight ">
            <div className="items-center justify-center flex-col md:flex-row flex">
              <span className="text-cyan-300 mb-2">Learn <span className='text-gray-100'>Build</span></span>
              {/* <span className="text-gray-100">Build</span> */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 animate-gradient">Succeed</span>
            </div>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mt-4 text-5xl md:text-6xl ">with code4You</span>
          </h1>

          <p className=" md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
            Transform your coding skills with hands-on learning, real-world projects, and expert guidance. Start your journey to becoming a pro developer today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 overflow-hidden text-lg">
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Link to={'/code-compiler'}>✨ Start Codding Free</Link>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="px-8 py-4 border-2 border-cyan-400 text-cyan-300 font-bold rounded-xl hover:bg-blue-900/50 transition-all duration-300 hover:scale-105 text-lg">
              📚 Explore Courses
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 mt-16">
            <div className="bg-gradient-to-br from-blue-700/50 to-blue-900/50 border border-blue-500/50 rounded-xl py-3 backdrop-blur-sm hover:border-blue-400/70 transition-all hover:scale-105 cursor-pointer">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-blue-200">Awesome Courses</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/50 rounded-xl py-3 backdrop-blur-sm hover:border-cyan-400/70 transition-all hover:scale-105 cursor-pointer">
              <div className="text-3xl mb-2">👨‍💻</div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-blue-200">Happy Learners</p>
            </div>
            <div className="bg-gradient-to-br from-teal-900/50 to-blue-900/50 border border-teal-500/50 rounded-xl py-3 backdrop-blur-sm hover:border-teal-400/70 transition-all hover:scale-105 cursor-pointer">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-2xl font-bold text-white">95%</p>
              <p className="text-blue-200">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Categories Section */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8 border-t border-blue-700/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Popular Courses</h2>
            <p className="text-xl text-blue-200">Choose from our extensive library of programming and technology courses</p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-20 w-20 text-blue-600 mx-auto mb-6" />
              <p className="text-blue-300 text-xl">No courses available yet</p>
              <p className="text-blue-400 mt-2">Check back soon for amazing content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => {
                const Icon = courseIcons[course.name] || GraduationCap;
                const colorClass = courseColors[course.name] || 'from-purple-500 to-cyan-500';
                const [gradStart, gradEnd] = colorClass.split(' ');

                return (
                  <div
                    key={course._id}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800/50 to-blue-900/50 border border-blue-600/60 hover:border-cyan-400/70 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/30"
                  >
                    {/* Gradient top bar */}
                    <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>

                    {/* Animated background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 group-hover:from-cyan-500/15 group-hover:to-blue-500/15 transition-colors duration-300"></div>

                    <div className="relative py-3 z-10 lg:p-4 md:p-4 flex flex-col items-center text-center  justify-between">
                      <div className={`sm:w-24 sm:h-24 lg:h-20 lg:w-20  rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-6 shadow-md shadow-blue-900/60 group-hover:shadow-cyan-500/70 transition-all duration-300 transform group-hover:scale-110 group-hover:-rotate-6`}>
                        <Icon className="h-14 w-12 py-2 sm:w-12 text-white" />
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-white mb-2">{course.name}</h3>
                        <p className="text-blue-300 text-sm mb-6">Master this in-demand course</p>
                      </div>

                      {course.name !== 'BCA' && course.name !== 'MCA' ? (
                        <Link
                          to={`/course/${course._id}/branches`}
                          className="group/btn relative inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <div className="px-4 py-2 bg-blue-700/40 text-blue-300 rounded-lg text-sm">Coming Soon</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-700/60 via-cyan-700/60 to-blue-700/60 border border-blue-500/60 rounded-3xl p-12 backdrop-blur-md hover:border-cyan-400/80 transition-colors">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Code Like a Pro?</h2>
            <p className="text-xl text-blue-100 mb-8">Join 50K+ learners building amazing projects and landing dream jobs</p>
            <button className="group relative px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105">
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Link to={'/code-compiler'} >🚀 Start Code Today</Link>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-700 bg-gradient-to-b from-blue-900/80 to-black py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Learn</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">License</a></li>
              </ul>
            </div>
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
