import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  User, Mail, MapPin, Phone, Edit2, Save, X,
  FileText, Coins, Calendar, TrendingUp
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [myPapers, setMyPapers] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        profileImage: user.profileImage || ''
      });
      fetchMyPapers();
    }
  }, [user]);

  const fetchMyPapers = async () => {
    try {
      const { data } = await api.get('/papers/my-papers');
      setMyPapers(data.data);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      profileImage: user.profileImage
    });
    setEditing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={formData.profileImage || 'https://via.placeholder.com/150'}
                    alt={formData.name}
                    className="w-32 h-32 rounded-full border-4 border-cyan-400 mx-auto mb-4"
                  />
                  {user?.isOnline && (
                    <span className="absolute bottom-6 right-2 h-6 w-6 rounded-full bg-green-400 border-4 border-white"></span>
                  )}
                </div>
                {!editing ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600 mt-1">{user?.bio}</p>
                  </>
                ) : (
                  <div className="space-y-2 mt-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Name"
                    />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Bio"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {!editing ? (
                  <>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span className="text-sm">{user?.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3" />
                      <span className="text-sm">{user?.phone || 'Not specified'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-gray-600" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Location"
                      />
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-gray-600" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Phone"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="text-sm">
                    Joined {new Date(user?.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Papers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Papers Uploaded</p>
                    <p className="text-2xl font-bold text-gray-900">{user?.papersUploaded || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-xl">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Coins Earned</p>
                    <p className="text-2xl font-bold text-gray-900">{user?.coins || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Contribution Rank</p>
                    <p className="text-2xl font-bold text-gray-900">#{Math.floor(Math.random() * 100) + 1}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* My Papers */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Uploaded Papers</h2>
              
              {myPapers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">You haven't uploaded any papers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPapers.map((paper) => (
                    <div
                      key={paper._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{paper.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {paper.branch?.name} • {paper.paperCode}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                          {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
