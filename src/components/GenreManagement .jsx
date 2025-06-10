import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/axio";

const GenreManagement = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    genre_cover_url: '', // Changed to match API field name
    is_active: true,
  });
  const [newCoverFile, setNewCoverFile] = useState(null); // Separate state for new file
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null); // Ref for resetting file input

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.get('api/store/genre/');
      console.log(response.data.data);
      setGenres(response.data.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file); // Store the new file separately
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active);
      
      
      // Only append genre_cover if a new file is selected
      if (newCoverFile) {
        formDataToSend.append('genre_cover', newCoverFile); // Backend expects 'genre_cover' for file upload
      }

      if (editingGenre) {
        // Update existing genre
        await api.put(`api/store/genre/${formData.id}/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        console.log(formDataToSend,"creting");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key, value);
        }
        // Add new genre
        await api.post('api/store/genre/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      fetchGenres(); // Refresh the list
      resetForm();
    } catch (error) {
      console.error("Error saving genre:", error);
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setFormData({
      id: genre.id,
      name: genre.name,
      description: genre.description,
      genre_cover_url: genre.genre_cover_url, // Use genre_cover_url from API
      is_active: genre.is_active,
    });
    setNewCoverFile(null); // Reset new file
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      try {
        await api.delete(`api/store/genre/${id}/`);
        fetchGenres();
      } catch (error) {
        console.error("Error deleting genre:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '', genre_cover_url: '', is_active: true });
    setNewCoverFile(null);
    setEditingGenre(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Genre Management</h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Add New Genre
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingGenre ? 'Edit Genre' : 'Add New Genre'}
          </h2>
          <form onSubmit={handleSubmit}>
            {editingGenre && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Genre Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Genre Cover Image</label>
              <input
                type="file"
                name="genre_cover"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                ref={fileInputRef} // Add ref to file input
              />
              {/* Display preview */}
              {(formData.genre_cover_url || newCoverFile) && (
                <img
                  src={
                    newCoverFile
                      ? URL.createObjectURL(newCoverFile)
                      : formData.genre_cover_url
                  }
                  alt="Genre cover preview"
                  className="mt-2 h-24 w-24 object-cover rounded"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    e.target.src = '/fallback-image.jpg'; // Optional fallback image
                  }}
                />
              )}
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="mr-2"
                />
                <span className="text-gray-700">Is Active</span>
              </label>
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
                {editingGenre ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {genres.map((genre) => (
              <tr key={genre.id}>
                <td className="px-6 py-4 whitespace-nowrap">{genre.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {genre.genre_cover_url ? (
                    <img
                      src={genre.genre_cover_url}
                      alt={`${genre.name} cover`}
                      className="h-16 w-16 object-cover rounded"
                      onError={(e) => {
                        console.error("Error loading table image:", e);
                        e.target.src = '/fallback-image.jpg'; // Optional fallback image
                      }}
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{genre.name}</td>
                <td className="px-6 py-4">{genre.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {genre.is_active ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(genre)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(genre.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenreManagement;