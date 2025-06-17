import React, { useEffect, useState, useRef } from 'react';
import api from "../api/axio";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    profile_image: null,
  });
  const [newProfileImage, setNewProfileImage] = useState(null);
  const profileImageInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('api/user/');
      setProfile(response.data.data);
      setFormData({
        first_name: response.data.data.first_name || '',
        last_name: response.data.data.last_name || '',
        phone_number: response.data.data.phone_number || '',
        profile_image: response.data.data.profile_image || null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire('Error!', 'Failed to fetch profile details.', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      setFormData((prev) => ({
        ...prev,
        profile_image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone_number', formData.phone_number);

      if (newProfileImage) {
        formDataToSend.append('profile_image', newProfileImage);
      }

      await api.patch('api/edit/user/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire('Success!', 'Profile updated successfully!', 'success');
      setEditMode(false);
      fetchProfile();
      setNewProfileImage(null);
      if (profileImageInputRef.current) profileImageInputRef.current.value = '';
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire('Error!', 'There was a problem updating the profile.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone_number: profile?.phone_number || '',
      profile_image: profile?.profile_image || null,
    });
    setNewProfileImage(null);
    setEditMode(false);
    if (profileImageInputRef.current) profileImageInputRef.current.value = '';
  };

  const handleLogout = async () => {
    logout()
  };

  if (!profile) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Profile Image</label>
              <input
                type="file"
                name="profile_image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                ref={profileImageInputRef}
              />
              {(formData.profile_image || newProfileImage) && (
                <img
                  src={typeof formData.profile_image === 'string' 
                    ? `https://myshelf-backend.onrender.com/${formData.profile_image}`
                    : formData.profile_image}
                  alt="Profile preview"
                  className="mt-2 h-24 w-24 object-cover rounded-full"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center mb-6">
              <img
                src={profile.profile_image 
                  ? `https://myshelf-backend.onrender.com/${profile.profile_image}`
                  : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover mr-4"
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium">Phone Number</label>
                <p className="text-gray-600">{profile.phone_number || 'N/A'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;