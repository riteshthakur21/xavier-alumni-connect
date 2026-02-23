// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '@/contexts/AuthContext';

// export default function EditProfile() {
//   const { user, loading: authLoading } = useAuth();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [hoverChoosePhoto, setHoverChoosePhoto] = useState(false); // New state for hover

//   // Form State
//   const [formData, setFormData] = useState({
//     name: '',
//     batchYear: '',
//     department: '',
//     company: '',
//     jobTitle: '',
//     location: '',
//     linkedinUrl: '',
//     bio: '',
//     skills: '',
//     contactPublic: false
//   });

//   const [photo, setPhoto] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   // 1. Data Fetch Karna (Pre-fill Form)
//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!user) return;

//       try {
//         const res = await axios.get(`http://localhost:5000/api/alumni/${user.id}`);
//         const data = res.data.alumni;
//         const profile = data.alumniProfile || {};

//         setFormData({
//           name: data.name || '',
//           batchYear: profile.batchYear || '',
//           department: profile.department || '',
//           company: profile.company || '',
//           jobTitle: profile.jobTitle || '',
//           location: profile.location || '',
//           linkedinUrl: profile.linkedinUrl || '',
//           bio: profile.bio || '',
//           skills: profile.skills ? profile.skills.join(', ') : '',
//           contactPublic: profile.contactPublic || false
//         });

//         if (profile.photoUrl) {
//           setPreviewUrl(`http://localhost:5000${profile.photoUrl}`);
//         }
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//         toast.error('Failed to load profile data', {
//           icon: '❌',
//           duration: 3000,
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!authLoading && user) {
//       fetchProfile();
//     }
//   }, [user, authLoading]);

//   // 2. Input Change Handler
//   const handleChange = (e: any) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   // 3. Photo Change Handler
//   const handlePhotoChange = (e: any) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];

//       // Basic validation
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error('File size should be less than 5MB', {
//           icon: '⚠️',
//           duration: 3000,
//         });
//         return;
//       }

//       if (!file.type.startsWith('image/')) {
//         toast.error('Please select an image file (JPG, PNG, etc.)', {
//           icon: '⚠️',
//           duration: 3000,
//         });
//         return;
//       }

//       setPhoto(file);
//       setPreviewUrl(URL.createObjectURL(file));

//       toast.success('Photo selected!', {
//         icon: '📸',
//         duration: 2000,
//       });
//     }
//   };

//   // 4. Submit Logic (Update Profile)
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const data = new FormData();
//       data.append('name', formData.name);
//       data.append('company', formData.company);
//       data.append('jobTitle', formData.jobTitle);
//       data.append('location', formData.location);
//       data.append('linkedinUrl', formData.linkedinUrl);
//       data.append('bio', formData.bio);
//       data.append('contactPublic', String(formData.contactPublic));

//       // Convert skills to array
//       const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
//       data.append('skills', JSON.stringify(skillsArray));

//       if (photo) {
//         data.append('photo', photo);
//       }

//       const toastId = toast.loading('Updating profile...');

//       await axios.put(`http://localhost:5000/api/alumni/${user?.id}`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       toast.success('Profile updated successfully! 🎉', {
//         id: toastId,
//         duration: 4000,
//       });

//       // Small delay before redirect
//       setTimeout(() => {
//         router.push('/dashboard');
//       }, 1500);

//     } catch (error: any) {
//       console.error('Error updating profile:', error);

//       const errorMessage = error.response?.data?.message || 'Failed to update profile';
//       toast.error(errorMessage, {
//         duration: 4000,
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
//         <div className="text-center">
//           <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600 animate-pulse">Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
//       <div className="max-w-3xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 text-center md:text-left">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit Profile </h1>
//               <p className="text-gray-600">Update your alumni profile information</p>
//             </div>
//             <button
//               onClick={() => router.back()}
//               className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors self-start md:self-center"
//             >
//               <i className="fas fa-arrow-left"></i>
//               Back
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Photo Upload Section */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">            
//             <div className="flex flex-col sm:flex-row items-center gap-8">
//               <div className="relative">
//                 <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden border-4 border-white shadow-lg">
//                   {previewUrl ? (
//                     <img 
//                       src={previewUrl} 
//                       alt="Profile" 
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center">
//                       <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
//                         <i className="fas fa-user text-blue-400 text-3xl"></i>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Upload a new photo
//                     </label>
//                     <div className="flex items-center gap-4">
//                       <label 
//                         className="cursor-pointer relative"
//                         onMouseEnter={() => setHoverChoosePhoto(true)}
//                         onMouseLeave={() => setHoverChoosePhoto(false)}
//                       >
//                         <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
//                           <i className="fas fa-camera"></i>
//                           <span>Choose Photo</span>
//                           <input 
//                             type="file" 
//                             accept="image/*"
//                             onChange={handlePhotoChange}
//                             className="hidden"
//                           />
//                         </div>
//                       </label>

//                       {/* Hover Text */}
//                       {hoverChoosePhoto && (
//                         <div className="absolute ml-2 mt-10 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg transition-opacity duration-200">
//                           JPG, PNG, WEBP up to 5MB
//                           <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Read-only Academic Info */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-600">Batch Year</label>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <i className="fas fa-calendar-alt text-blue-600"></i>
//                   </div>
//                   <p className="text-lg font-semibold text-gray-900">{formData.batchYear || 'Not specified'}</p>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-600">Department</label>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <i className="fas fa-graduation-cap text-purple-600"></i>
//                   </div>
//                   <p className="text-lg font-semibold text-gray-900">{formData.department || 'Not specified'}</p>
//                 </div>
//               </div>
//             </div>
//             <p className="text-sm text-gray-500 mt-4">
//               <i className="fas fa-lock mr-1"></i>
//               These details are permanent and cannot be changed
//             </p>
//           </div>

//           {/* Personal Information */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <i className="fas fa-user mr-2 text-blue-500"></i>
//                   Full Name *
//                 </label>
//                 <input 
//                   type="text" 
//                   name="name" 
//                   value={formData.name} 
//                   onChange={handleChange} 
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                   required 
//                   placeholder="Enter your full name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <i className="fas fa-map-marker-alt mr-2 text-green-500"></i>
//                   Location
//                 </label>
//                 <input 
//                   type="text" 
//                   name="location" 
//                   value={formData.location} 
//                   onChange={handleChange} 
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
//                   placeholder="e.g., Mumbai, India"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Professional Information */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>

//             <div className="grid md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <i className="fas fa-building mr-2 text-purple-500"></i>
//                   Company / Organization
//                 </label>
//                 <input 
//                   type="text" 
//                   name="company" 
//                   value={formData.company} 
//                   onChange={handleChange} 
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
//                   placeholder="Where do you work?"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <i className="fas fa-briefcase mr-2 text-yellow-500"></i>
//                   Job Title
//                 </label>
//                 <input 
//                   type="text" 
//                   name="jobTitle" 
//                   value={formData.jobTitle} 
//                   onChange={handleChange} 
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
//                   placeholder="What is your role?"
//                 />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <i className="fas fa-link mr-2 text-blue-500"></i>
//                 LinkedIn Profile
//               </label>
//               <input 
//                 type="url" 
//                 name="linkedinUrl" 
//                 value={formData.linkedinUrl} 
//                 onChange={handleChange} 
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                 placeholder="https://linkedin.com/in/..."
//               />
//               <p className="text-sm text-gray-500 mt-2">
//                 Share your LinkedIn profile to help others connect with you
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <i className="fas fa-star mr-2 text-orange-500"></i>
//                 Skills & Expertise
//               </label>
//               <input 
//                 type="text" 
//                 name="skills" 
//                 value={formData.skills} 
//                 onChange={handleChange} 
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
//                 placeholder="React, Python, Management, Marketing, etc."
//               />
//               <p className="text-sm text-gray-500 mt-2">
//                 Separate skills with commas. These help other alumni find you.
//               </p>
//             </div>
//           </div>

//           {/* Bio Section */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">About You</h2>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <i className="fas fa-edit mr-2 text-indigo-500"></i>
//                 Bio / Introduction
//               </label>
//               <textarea 
//                 name="bio" 
//                 rows={5} 
//                 value={formData.bio} 
//                 onChange={handleChange} 
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
//                 placeholder="Tell us about your professional journey, achievements, and interests..."
//               ></textarea>
//               <div className="flex justify-between items-center mt-2">
//                 <p className="text-sm text-gray-500">
//                   A well-written bio helps you connect with relevant alumni
//                 </p>
//                 <span className={`text-sm ${formData.bio.length > 800 ? 'text-red-500' : 'text-gray-500'}`}>
//                   {formData.bio.length}/1000 characters
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Privacy Settings */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>

//             <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center h-5">
//                 <input 
//                   type="checkbox" 
//                   name="contactPublic" 
//                   id="contactPublic"
//                   checked={formData.contactPublic} 
//                   onChange={handleChange} 
//                   className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//               </div>
//               <div className="ml-3">
//                 <label htmlFor="contactPublic" className="text-sm font-medium text-gray-900 cursor-pointer">
//                   Make my contact information visible to other users
//                 </label>
//                 <p className="text-sm text-gray-500">
//                   When enabled, your email and LinkedIn profile will be visible to verified users
//                 </p>
//               </div>
//               <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${formData.contactPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
//                 {formData.contactPublic ? 'Public' : 'Private'}
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//               >
//                 <i className="fas fa-times"></i>
//                 Cancel
//               </button>
//               <button 
//                 type="submit" 
//                 disabled={saving}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {saving ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Saving Changes...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-save"></i>
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>

//             <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//               <p className="text-sm text-blue-700 text-center">
//                 <i className="fas fa-lightbulb mr-2"></i>
//                 Your profile will be updated immediately and visible to other users.
//               </p>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* Add some custom styles for better form inputs */}
//       <style jsx>{`
//         input:focus, textarea:focus {
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         .border-3 {
//           border-width: 3px;
//         }
//       `}</style>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoverChoosePhoto, setHoverChoosePhoto] = useState(false);
  

  // Form State (added rollNo)
  const [formData, setFormData] = useState({
    name: '',
    batchYear: '',
    department: '',
    rollNo: '',                // <-- new field
    company: '',
    jobTitle: '',
    location: '',
    linkedinUrl: '',
    bio: '',
    skills: '',
    contactPublic: false
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Fetch profile and pre‑fill form
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/alumni/${user.id}`);
        const data = res.data.alumni;
        const profile = data.alumniProfile || {};

        setFormData({
          name: data.name || '',
          batchYear: profile.batchYear || '',
          department: profile.department || '',
          rollNo: profile.rollNo || '',               // <-- set rollNo
          company: profile.company || '',
          jobTitle: profile.jobTitle || '',
          location: profile.location || '',
          linkedinUrl: profile.linkedinUrl || '',
          bio: profile.bio || '',
          skills: profile.skills ? profile.skills.join(', ') : '',
          contactPublic: profile.contactPublic || false
        });

        if (profile.photoUrl) {
          setPreviewUrl(profile.photoUrl);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data', {
          icon: '❌',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  // 2. Input change handler
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. Photo change handler
  const handlePhotoChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB', {
          icon: '⚠️',
          duration: 3000,
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG, etc.)', {
          icon: '⚠️',
          duration: 3000,
        });
        return;
      }

      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));

      toast.success('Photo selected!', {
        icon: '📸',
        duration: 2000,
      });
    }
  };

  // 4. Submit form
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('company', formData.company);
      data.append('jobTitle', formData.jobTitle);
      data.append('location', formData.location);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('bio', formData.bio);
      data.append('contactPublic', String(formData.contactPublic));

      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      data.append('skills', JSON.stringify(skillsArray));

      if (photo) {
        data.append('photo', photo);
      }

      const toastId = toast.loading('Updating profile...');

      await axios.put(`http://localhost:5000/api/alumni/${user?.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profile updated successfully! 🎉', {
        id: toastId,
        duration: 4000,
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating profile:', error);

      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit Profile</h1>
              <p className="text-gray-600">Update your alumni profile information</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors self-start md:self-center"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h2>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden border-4 border-white shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-blue-400 text-3xl"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload a new photo
                    </label>
                    <div className="flex items-center gap-4">
                      <label
                        className="cursor-pointer relative"
                        onMouseEnter={() => setHoverChoosePhoto(true)}
                        onMouseLeave={() => setHoverChoosePhoto(false)}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                          <i className="fas fa-camera"></i>
                          <span>Choose Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </div>
                      </label>

                      {hoverChoosePhoto && (
                        <div className="absolute ml-2 mt-10 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg transition-opacity duration-200">
                          JPG, PNG, WEBP up to 5MB
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Read-only Academic Info (now includes roll number) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Batch Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Batch Year</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-calendar-alt text-blue-600"></i>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {formData.batchYear || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Department</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-graduation-cap text-purple-600"></i>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {formData.department || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-id-card text-green-600"></i>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {formData.rollNo || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
              <i className="fas fa-lock"></i>
              Academic details (batch, department, roll number) are permanent and cannot be changed.
            </p>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-user mr-2 text-blue-500"></i>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt mr-2 text-green-500"></i>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="e.g., Mumbai, India"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-building mr-2 text-purple-500"></i>
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Where do you work?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-briefcase mr-2 text-yellow-500"></i>
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  placeholder="What is your role?"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-link mr-2 text-blue-500"></i>
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://linkedin.com/in/..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Share your LinkedIn profile to help others connect with you
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-star mr-2 text-orange-500"></i>
                Skills & Expertise
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="React, Python, Management, Marketing, etc."
              />
              <p className="text-sm text-gray-500 mt-2">
                Separate skills with commas. These help other alumni find you.
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">About You</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-edit mr-2 text-indigo-500"></i>
                Bio / Introduction
              </label>
              <textarea
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Tell us about your professional journey, achievements, and interests..."
              ></textarea>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1">
                <p className="text-sm text-gray-500">
                  A well-written bio helps you connect with relevant alumni
                </p>
                <span className={`text-sm ${formData.bio.length > 800 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.bio.length}/1000 characters
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="contactPublic"
                  id="contactPublic"
                  checked={formData.contactPublic}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="contactPublic" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Make my contact information visible to other users
                </label>
                <p className="text-sm text-gray-500">
                  When enabled, your email and LinkedIn profile will be visible to verified users
                </p>
              </div>
              <div className={`sm:ml-auto px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${formData.contactPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {formData.contactPublic ? 'Public' : 'Private'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 text-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Your profile will be updated immediately and visible to other users.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Small style addition */}
      <style jsx>{`
        input:focus, textarea:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
}