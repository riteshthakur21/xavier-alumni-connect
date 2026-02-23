// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Image from 'next/image';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface AlumniProfile {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   createdAt: string;
//   alumniProfile: {
//     batchYear: number;
//     department: string;
//     rollNo?: string;
//     company?: string;
//     jobTitle?: string;
//     linkedinUrl?: string;
//     photoUrl?: string;
//     bio?: string;
//     location?: string;
//     skills: string[];
//     contactPublic: boolean;
//   };
// }

// export default function AlumniProfilePage() {
//   const params = useParams();
//   const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (params.id) {
//       fetchAlumniProfile();
//     }
//   }, [params.id]);

//   const fetchAlumniProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/api/alumni/${params.id}`);
//       setAlumni(response.data.alumni);
//     } catch (error) {
//       console.error('Error fetching alumni profile:', error);
//       toast.error('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (!alumni) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-secondary-900 mb-2">Profile Not Found</h2>
//           <p className="text-secondary-600">The alumni profile you're looking for doesn't exist.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       <div className="max-w-4xl mx-auto">
//         {/* Profile Header */}
//         <div className="card mb-8">
//           <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
//             {alumni.alumniProfile.photoUrl ? (
//               <Image
//                 src={`http://localhost:5000${alumni.alumniProfile.photoUrl}`}
//                 alt={alumni.name}
//                 width={150}
//                 height={150}
//                 className="rounded-full object-cover border-4 border-primary-100"
//               />
//             ) : (
//               <div className="w-36 h-36 bg-primary-100 rounded-full flex items-center justify-center border-4 border-primary-200">
//                 <span className="text-primary-600 font-bold text-4xl">
//                   {alumni.name.charAt(0)}
//                 </span>
//               </div>
//             )}

//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-secondary-900 mb-2">
//                 {alumni.name}
//               </h1>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <p className="text-sm text-secondary-600">Batch Year</p>
//                   <p className="text-lg font-semibold text-secondary-900">
//                     {alumni.alumniProfile.batchYear}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-secondary-600">Department</p>
//                   <p className="text-lg font-semibold text-secondary-900">
//                     {alumni.alumniProfile.department}
//                   </p>
//                 </div>
//                 {alumni.alumniProfile.rollNo && (
//                   <div>
//                     <p className="text-sm text-secondary-600">Roll Number</p>
//                     <p className="text-lg font-semibold text-secondary-900">
//                       {alumni.alumniProfile.rollNo}
//                     </p>
//                   </div>
//                 )}
//                 {alumni.alumniProfile.location && (
//                   <div>
//                     <p className="text-sm text-secondary-600">Location</p>
//                     <p className="text-lg font-semibold text-secondary-900">
//                       📍 {alumni.alumniProfile.location}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {alumni.alumniProfile.company && (
//                 <div className="mb-4">
//                   <p className="text-sm text-secondary-600">Current Position</p>
//                   <p className="text-xl font-semibold text-primary-600">
//                     {alumni.alumniProfile.jobTitle} at {alumni.alumniProfile.company}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Bio */}
//           {alumni.alumniProfile.bio && (
//             <div className="card">
//               <h3 className="text-xl font-semibold text-secondary-900 mb-4">About</h3>
//               <p className="text-secondary-700 leading-relaxed">
//                 {alumni.alumniProfile.bio}
//               </p>
//             </div>
//           )}

//           {/* Skills */}
//           {alumni.alumniProfile.skills && alumni.alumniProfile.skills.length > 0 && (
//             <div className="card">
//               <h3 className="text-xl font-semibold text-secondary-900 mb-4">Skills</h3>
//               <div className="flex flex-wrap gap-2">
//                 {alumni.alumniProfile.skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Contact Information */}
//           <div className="card">
//             <h3 className="text-xl font-semibold text-secondary-900 mb-4">Contact Information</h3>
//             <div className="space-y-3">
//               {alumni.alumniProfile.contactPublic && (
//                 <>
//                   <div className="flex items-center space-x-3">
//                     <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                     <a
//                       href={`mailto:${alumni.email}`}
//                       className="text-secondary-700 hover:text-blue-600 hover:underline transition-colors"
//                     >
//                       {alumni.email}
//                     </a>
//                   </div>
//                 </>
//               )}

//               {alumni.alumniProfile.linkedinUrl && (
//                 <div className="flex items-center space-x-3">
//                   <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//                   </svg>
//                   <a
//                     href={alumni.alumniProfile.linkedinUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-secondary-700 hover:text-primary-700 hover:underline transition-colors"
//                   >
//                     LinkedIn Profile
//                   </a>
//                 </div>
//               )}

//               {!alumni.alumniProfile.contactPublic && (
//                 <p className="text-sm text-secondary-500 italic">
//                   Contact information is private
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Member Since */}
//           <div className="card">
//             <h3 className="text-xl font-semibold text-secondary-900 mb-4">Member Information</h3>
//             <p className="text-secondary-700">
//               Joined on {new Date(alumni.createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  alumniProfile: {
    batchYear: number;
    department: string;
    rollNo?: string;
    company?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    photoUrl?: string;
    bio?: string;
    location?: string;
    skills: string[];
    contactPublic: boolean;
  };
}

export default function AlumniProfilePage() {
  const params = useParams();
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAlumniProfile();
    }
  }, [params.id]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/alumni/${params.id}`);
      setAlumni(response.data.alumni);
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton for better perceived performance
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          {/* Back button placeholder */}
          <div className="h-6 w-16 bg-gray-200 rounded mb-4"></div>
          
          {/* Profile header skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-36 h-36 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3 w-full">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto sm:mx-0"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content grid skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 h-40"></div>
            <div className="bg-white rounded-lg shadow-md p-6 h-40"></div>
            <div className="bg-white rounded-lg shadow-md p-6 h-40"></div>
            <div className="bg-white rounded-lg shadow-md p-6 h-40"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (!alumni) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Profile Not Found</h2>
          <p className="text-secondary-600 mb-6">
          The profile you're looking for doesn't exist or may have been removed.          
          </p>
          <button
            onClick={fetchAlumniProfile}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Retry loading profile"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors mb-4 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {alumni.alumniProfile.photoUrl ? (
              <Image
                src={alumni.alumniProfile.photoUrl}
                alt={`${alumni.name}'s profile picture`}
                width={150}
                height={150}
                className="rounded-full object-cover border-4 border-primary-100"
                priority
              />
            ) : (
              <div
                className="w-36 h-36 bg-primary-100 rounded-full flex items-center justify-center border-4 border-primary-200"
                aria-label="Profile avatar placeholder"
              >
                <span className="text-primary-600 font-bold text-4xl">
                  {alumni.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2 break-words">
                {alumni.name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-secondary-600">Batch Year</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {alumni.alumniProfile.batchYear}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Department</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {alumni.alumniProfile.department}
                  </p>
                </div>
                {alumni.alumniProfile.rollNo && (
                  <div>
                    <p className="text-sm text-secondary-600">Roll Number</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {alumni.alumniProfile.rollNo}
                    </p>
                  </div>
                )}
                {alumni.alumniProfile.location && (
                  <div>
                    <p className="text-sm text-secondary-600">Location</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      📍 {alumni.alumniProfile.location}
                    </p>
                  </div>
                )}
              </div>

              {alumni.alumniProfile.company && (
                <div className="mb-4">
                  <p className="text-sm text-secondary-600">Current Position</p>
                  <p className="text-xl font-semibold text-primary-600">
                    {alumni.alumniProfile.jobTitle} at {alumni.alumniProfile.company}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bio */}
          {alumni.alumniProfile.bio && (
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">About</h3>
              <p className="text-secondary-700 leading-relaxed break-words">
                {alumni.alumniProfile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {alumni.alumniProfile.skills && alumni.alumniProfile.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {alumni.alumniProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {alumni.alumniProfile.contactPublic && (
                <>
                  <div className="flex items-center space-x-3 group">
                    <svg
                      className="w-5 h-5 text-secondary-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <a
                        href={`mailto:${alumni.email}`}
                        className="text-secondary-700 hover:text-blue-600 hover:underline transition-colors truncate"
                        title={alumni.email}
                      >
                        {alumni.email}
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(alumni.email);
                          toast.success('Email copied to clipboard!');
                        }}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                        aria-label="Copy email address"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {alumni.alumniProfile.linkedinUrl && (
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-secondary-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <a
                    href={alumni.alumniProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-700 hover:text-primary-700 hover:underline transition-colors truncate"
                    title={alumni.alumniProfile.linkedinUrl}
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}

              {!alumni.alumniProfile.contactPublic && (
                <p className="text-sm text-secondary-500 italic">
                  Contact information is private
                </p>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <h3 className="text-xl font-semibold text-secondary-900 mb-4">Member Information</h3>
            <p className="text-secondary-700">
              Joined on{' '}
              {new Date(alumni.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}