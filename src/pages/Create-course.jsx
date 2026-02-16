import React, { useState, useMemo } from 'react';
import { BookOpen, Code, FileText, Image, Upload, X, Check, Cpu, Database, Smartphone, Palette, Zap, Globe, BarChart3, Cloud, Shield, Layers, GraduationCap, Award, Briefcase, Calculator, Microscope, Atom, Building2, Users } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    icon: null,
    iconPreview: null,
    autoIcon: null
  });
const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Icon mapping based on course name keywords
  const iconMappings = {
    // University Degrees - Engineering
    'btech': Building2,
    'b.tech': Building2,
    'bachelor of technology': Building2,
    'be': Building2,
    'b.e': Building2,
    'engineering': Building2,
    'm.tech': Award,
    'mtech': Award,
    'master of technology': Award,

    // University Degrees - Computer Applications
    'bca': Cpu,
    'b.c.a': Cpu,
    'bachelor of computer applications': Cpu,
    'mca': Award,
    'm.c.a': Award,
    'master of computer applications': Award,

    // University Degrees - General
    'bsc': Microscope,
    'b.sc': Microscope,
    'bachelor of science': Microscope,
    'msc': Microscope,
    'm.sc': Microscope,
    'master of science': Microscope,
    'ba': BookOpen,
    'b.a': BookOpen,
    'bachelor of arts': BookOpen,
    'ma': BookOpen,
    'm.a': BookOpen,
    'master of arts': BookOpen,
    'mba': Briefcase,
    'm.b.a': Briefcase,
    'master of business': Briefcase,

    // University Degrees - Other
    'bcom': Calculator,
    'b.com': Calculator,
    'bachelor of commerce': Calculator,
    'mcom': Calculator,
    'm.com': Calculator,
    'master of commerce': Calculator,
    'llb': Shield,
    'law': Shield,
    'medicine': Microscope,
    'nursing': Users,
    'pharmacy': Microscope,

    // Subject-based
    'mathematics': Calculator,
    'maths': Calculator,
    'physics': Atom,
    'chemistry': Atom,
    'biology': Microscope,
    'economics': BarChart3,
    'business': Briefcase,
    'accounting': Calculator,
    'finance': Briefcase,
    'management': Users,
    'english': BookOpen,
    'history': Award,
    'geography': Globe,
  };

  // Get auto-selected icon based on course name
  const getAutoIcon = (courseName) => {
    if (!courseName) return BookOpen;
    const lowerName = courseName.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMappings)) {
      if (lowerName.includes(keyword)) {
        return icon;
      }
    }
    return BookOpen; // default icon
  };

  const autoSelectedIcon = useMemo(() => getAutoIcon(formData.name), [formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      autoIcon: name === 'name' ? getAutoIcon(value) : prev.autoIcon
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          icon: file,
          iconPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setFormData(prev => ({
      ...prev,
      icon: null,
      iconPreview: null
    }));
  };

  const resetToAutoIcon = () => {
    setFormData(prev => ({
      ...prev,
      icon: null,
      iconPreview: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('code', formData.code);
    formDataToSend.append('description', formData.description);
    if (formData.icon) {
      formDataToSend.append('icon', formData.icon);
    }

    // API call
    try {
      const response = await api.post('/courses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Course created successfully');
     setTimeout(() => {
        //  navigate('/')
     }, 1000);
      console.log('Course created:', response.data);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setFormData({
          name: '',
          code: '',
          description: '',
          icon: null,
          iconPreview: null
        });
        setSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div onClick={()=>navigate('/')} className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Create Course</h1>
          </div>
          <p className="text-gray-300 text-lg">Build a new learning experience</p>
        </div>

        {/* Main Form Card */}
        <div className="relative">
          {/* Decorative blur background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-20"></div>
          
          <form onSubmit={handleSubmit} className="relative bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
            
            {/* Course Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                <BookOpen className="w-4 h-4 inline mr-2 text-purple-400" />
                Course Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Advanced React Development"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-slate-700 transition duration-300"
              />
              <p className="text-xs text-gray-400 mt-1">Give your course a clear, descriptive name</p>
            </div>

            {/* Course Code */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                <Code className="w-4 h-4 inline mr-2 text-blue-400" />
                Course Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS-401"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition duration-300 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">Unique course identifier (e.g., CS-401)</p>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                <FileText className="w-4 h-4 inline mr-2 text-indigo-400" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your course content, objectives, and learning outcomes..."
                rows="4"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-slate-700 transition duration-300 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Provide a comprehensive description of your course</p>
            </div>

            {/* Icon Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                <Image className="w-4 h-4 inline mr-2 text-pink-400" />
                Course Icon
                <span className="text-xs font-normal text-purple-300 ml-2">(Auto-selected based on course name)</span>
              </label>
              
              {formData.iconPreview ? (
                <div className="relative w-full">
                  <div className="flex items-center justify-between bg-slate-700 border-2 border-purple-500 rounded-lg p-4 mb-3">
                    <div className="flex items-center space-x-4">
                      <img
                        src={formData.iconPreview}
                        alt="Course Icon Preview"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-purple-400"
                      />
                      <div>
                        <p className="text-white font-semibold">{formData.icon?.name}</p>
                        <p className="text-xs text-gray-400">{(formData.icon?.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetToAutoIcon}
                      className="p-2 hover:bg-slate-600 rounded-lg transition"
                      title="Use auto-selected icon instead"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Auto-Selected Icon Preview */}
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-6 flex flex-col items-center justify-center">
                    {React.createElement(autoSelectedIcon, {
                      className: 'w-24 h-24 text-white mb-3'
                    })}
                    <p className="text-white font-semibold text-center">
                      {formData.name || 'Course icon will appear here'}
                    </p>
                    <p className="text-purple-100 text-xs mt-1">Auto-selected icon</p>
                  </div>

                  {/* Custom Upload Option */}
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-slate-700 transition duration-300">
                      <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-300 font-medium text-sm">Or upload custom icon</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || success}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center space-x-2 ${
                  success
                    ? 'bg-green-500 hover:bg-green-600'
                    : isLoading
                    ? 'bg-purple-500 opacity-75 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {success ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Course Created Successfully!</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Course...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    <span>Create Course</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Info */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-gray-400 text-center">
                All fields are required. You can edit the course details later from your dashboard.
              </p>
            </div>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
            <h3 className="text-white font-semibold text-sm">Easy Setup</h3>
            <p className="text-gray-400 text-xs mt-1">Create courses in minutes with our intuitive form</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <Code className="w-6 h-6 text-blue-400 mb-2" />
            <h3 className="text-white font-semibold text-sm">Unique Codes</h3>
            <p className="text-gray-400 text-xs mt-1">Assign unique identifiers to organize courses</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <Image className="w-6 h-6 text-pink-400 mb-2" />
            <h3 className="text-white font-semibold text-sm">Visual Identity</h3>
            <p className="text-gray-400 text-xs mt-1">Upload icons to represent your courses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
