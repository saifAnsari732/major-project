import React, { useState, useEffect } from 'react';
import { MapPin, BookOpen, Code, FileText, Check, PlusCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CreateBranch() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    courseId: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Courses loaded from API
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Degree keywords to prioritize / filter by
  const degreeKeywords = [
    'btech', 'b.tech', 'bachelor of technology', 'be', 'b.e', 'engineering',
    'bca', 'b.c.a', 'bachelor of computer applications',
    'mca', 'm.c.a', 'master of computer applications',
    'bsc', 'b.sc', 'bachelor of science', 'msc', 'm.sc',
    'ba', 'b.a', 'bachelor of arts', 'ma', 'm.a',
    'mba', 'm.b.a', 'bcom', 'b.com', 'mcom', 'm.com'
  ];

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const res = await api.get('/courses');
        // API returns array of courses; map and filter by degree keywords
        const all = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Normalize and pick courses whose name includes any keyword
        const filtered = all.filter((c) => {
          const name = (c.name || c.title || '').toLowerCase();
          return degreeKeywords.some(k => name.includes(k));
        });

        // If none matched, fall back to all
        const finalList = filtered.length ? filtered : all;

        if (mounted) setCourses(finalList.map(c => ({ id: c._id || c.id || c.courseId || c.slug || c.name, label: c.name || c.title || c.label })));
      } catch (err) {
        if (mounted) setCoursesError(err.message || 'Failed to load courses');
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    return form.name.trim() && form.code.trim() && form.courseId && form.description.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert('Please fill all required fields');
      return;
    }
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
        course: form.courseId,
        description: form.description.trim()
    };
    setIsLoading(true);
    try {
      const response = await api.post('/branches', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      // success
      toast.success('Branch created successfully');
      setSuccess(true);
      // clear form after success
    //   setForm({ name: '', code: '', courseId: '', description: '' });
      // keep success state briefly then reset
      setTimeout(() => setSuccess(false), 1800);
    } catch (error) {
      console.error('Create branch error:', error?.response || error.message || error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to create branch';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-slate-800/40 px-4 py-2 rounded-full">
            <MapPin className="w-8 h-8 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Create Branch</h2>
          </div>
          <p className="text-gray-300 mt-3">Add a new branch for a course with clear identification</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-md opacity-30"></div>
          <form onSubmit={handleSubmit} className="relative bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-2 text-indigo-400" />
                  Branch Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">Use a short, descriptive branch name</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  <Code className="w-4 h-4 inline mr-2 text-purple-400" />
                  Branch Code
                </label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="DUMMY CODE"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
                <p className="text-xs text-gray-400 mt-1">Short identifier used across the platform</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2 text-blue-400" />
                Course
              </label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{coursesLoading ? 'Loading courses...' : 'Select a course'}</option>
                {coursesLoading ? null : coursesError ? (
                  <option value="">Error loading courses</option>
                ) : (
                  courses.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))
                )}
              </select>
              {coursesError && <p className="text-xs text-red-400 mt-1">{coursesError}</p>}
              <p className="text-xs text-gray-400 mt-1">Choose the course this branch belongs to</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                <FileText className="w-4 h-4 inline mr-2 text-teal-400" />
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the branch, specialties, or focus areas"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">A short summary for users and admins</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 md:justify-between">
              <div className="text-sm text-gray-300">All fields are required</div>
              <div className="w-full md:w-64">
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${success ? 'bg-green-500 hover:bg-green-600' : isLoading ? 'bg-indigo-600/80 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'}`}
                >
                  {success ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Branch Created</span>
                    </>
                  ) : isLoading ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Create Branch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold">Tips</h4>
            <ul className="text-gray-400 text-xs mt-2 space-y-1">
              <li>- Use clear codes (e.g., CS, IT)</li>
              <li>- Keep descriptions concise and informative</li>
            </ul>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <p className="text-gray-400 text-xs mt-2">Manage branches later from the admin dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
