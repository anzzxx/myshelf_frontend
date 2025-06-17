import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/axio";
import Swal from 'sweetalert2';

const UserBookManagement = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    book_file: null,
    cover_image: null,
    page_count: '',
    reading_time: '',
    published_date: '',
    is_active: true,
    language: 'English',
    genre: ''
  });
  const [errors, setErrors] = useState({});
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newBookFile, setNewBookFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverInputRef = useRef(null);
  const bookFileInputRef = useRef(null);

  useEffect(() => {
    fetchUserBooks();
    fetchGenres();
  }, []);

  const fetchUserBooks = async () => {
    try {
      const response = await api.get('api/store/book/');
      setBooks(response.data.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      Swal.fire('Error!', 'Failed to fetch books.', 'error');
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await api.get('api/store/genres/');
      setGenres(response.data.results);
    } catch (error) {
      console.error("Error fetching genres:", error);
      Swal.fire('Error!', 'Failed to fetch genres.', 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Page count validation
    if (formData.page_count) {
      if (isNaN(formData.page_count) || formData.page_count < 1) {
        newErrors.page_count = 'Page count must be a positive number';
      } else if (formData.page_count > 10000) {
        newErrors.page_count = 'Page count must be less than 10,000';
      }
    }

    // Reading time validation
    if (formData.reading_time) {
      if (isNaN(formData.reading_time) || formData.reading_time < 1) {
        newErrors.reading_time = 'Reading time must be a positive number';
      } else if (formData.reading_time > 1000) {
        newErrors.reading_time = 'Reading time must be less than 1000 minutes';
      }
    }

    // Published date validation
    if (formData.published_date) {
      const selectedDate = new Date(formData.published_date);
      if (selectedDate > today) {
        newErrors.published_date = 'Published date cannot be in the future';
      }
    }

    // Genre validation
    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
    }

    // Cover image validation (only for new books)
    if (!editingBook && !newCoverFile) {
      newErrors.cover_image = 'Cover image is required';
    }

    // Book file validation (only for new books)
    if (!editingBook && !newBookFile) {
      newErrors.book_file = 'Book file is required';
    }

    // Validate file types if files are selected
    if (newCoverFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(newCoverFile.type)) {
        newErrors.cover_image = 'Only JPEG, PNG, or GIF images are allowed';
      } else if (newCoverFile.size > 5 * 1024 * 1024) { // 5MB
        newErrors.cover_image = 'Image must be less than 5MB';
      }
    }

    if (newBookFile) {
      if (newBookFile.type !== 'application/pdf') {
        newErrors.book_file = 'Only PDF files are allowed';
      } else if (newBookFile.size > 20 * 1024 * 1024) { // 20MB
        newErrors.book_file = 'PDF must be less than 20MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields to prevent negative values
    if (name === 'page_count' || name === 'reading_time') {
      const numericValue = value === '' ? '' : Math.max(0, parseInt(value) || '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file);
      setFormData(prev => ({ ...prev, cover_image: URL.createObjectURL(file) }));
    }
    if (errors.cover_image) {
      setErrors(prev => ({ ...prev, cover_image: '' }));
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBookFile(file);
    }
    if (errors.book_file) {
      setErrors(prev => ({ ...prev, book_file: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('page_count', formData.page_count);
      formDataToSend.append('reading_time', formData.reading_time);
      formDataToSend.append('published_date', formData.published_date);
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('genre', formData.genre);

      if (newCoverFile) {
        formDataToSend.append('cover_image', newCoverFile);
      } else if (editingBook && formData.cover_image) {
        // If editing and no new cover file, but cover_image exists, keep the existing one
        formDataToSend.append('cover_image', formData.cover_image);
      }

      if (newBookFile) {
        formDataToSend.append('book_file', newBookFile);
      } else if (editingBook && formData.book_file) {
        // If editing and no new book file, but book_file exists, keep the existing one
        formDataToSend.append('book_file', formData.book_file);
      }

      if (editingBook) {
        await api.put(`api/store/book/${formData.id}/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire('Success!', 'Book updated successfully!', 'success');
      } else {
        await api.post('api/store/book/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire('Success!', 'Book added successfully!', 'success');
      }

      fetchUserBooks();
      resetForm();
    } catch (error) {
      console.error("Error saving book:", error);
      let errorMessage = 'There was a problem saving the book.';
      if (error.response && error.response.data) {
        // Handle different error response formats
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
            .join('\n');
        } else {
          errorMessage = error.response.data;
        }
      }
      Swal.fire('Error!', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      id: book.id,
      title: book.title,
      description: book.description,
      cover_image: book.cover_image,
      book_file: book.book_file,
      page_count: book.page_count,
      reading_time: book.reading_time,
      published_date: book.published_date.split('T')[0],
      is_active: book.is_active,
      language: book.language,
      genre: book.genre
    });
    setNewCoverFile(null);
    setNewBookFile(null);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`api/store/book/${id}/`);
        Swal.fire('Deleted!', 'The book has been deleted.', 'success');
        fetchUserBooks();
      } catch (error) {
        console.error("Error deleting book:", error);
        Swal.fire('Error!', 'There was a problem deleting the book.', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      book_file: null,
      cover_image: null,
      page_count: '',
      reading_time: '',
      published_date: '',
      is_active: true,
      language: 'English',
      genre: ''
    });
    setNewCoverFile(null);
    setNewBookFile(null);
    setEditingBook(null);
    setShowForm(false);
    setErrors({});
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (bookFileInputRef.current) bookFileInputRef.current.value = '';
  };

  const formatReadingTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Book Management</h1>

      <button
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700 transition-colors"
      >
        Add New Book
      </button>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editingBook && (
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
            <div>
              <label className="block text-gray-700 mb-2">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                required
                maxLength={200}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows="3"
                maxLength={2000}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-gray-500 text-sm mt-1">{formData.description.length}/2000 characters</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Page Count</label>
                <input
                  type="number"
                  name="page_count"
                  value={formData.page_count}
                  onChange={handleInputChange}
                  min="1"
                  max="10000"
                  className={`w-full p-2 border rounded ${errors.page_count ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.page_count && <p className="text-red-500 text-sm mt-1">{errors.page_count}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Reading Time (minutes)</label>
                <input
                  type="number"
                  name="reading_time"
                  value={formData.reading_time}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className={`w-full p-2 border rounded ${errors.reading_time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.reading_time && <p className="text-red-500 text-sm mt-1">{errors.reading_time}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Published Date</label>
                <input
                  type="date"
                  name="published_date"
                  value={formData.published_date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full p-2 border rounded ${errors.published_date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.published_date && <p className="text-red-500 text-sm mt-1">{errors.published_date}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded border-gray-300"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Genre*</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.genre ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Cover Image {!editingBook && '*'}</label>
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className={`w-full p-2 border rounded ${errors.cover_image ? 'border-red-500' : 'border-gray-300'}`}
                  ref={coverInputRef}
                />
                {(formData.cover_image || newCoverFile) && (
                  <div className="mt-2">
                    <img
                      src={formData.cover_image}
                      alt="Cover preview"
                      className="h-24 w-24 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                )}
                {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
                {editingBook && !newCoverFile && (
                  <p className="text-gray-500 text-sm mt-1">Leave empty to keep current cover</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Book File (PDF) {!editingBook && '*'}</label>
                <input
                  type="file"
                  name="book_file"
                  accept=".pdf"
                  onChange={handleBookFileChange}
                  className={`w-full p-2 border rounded ${errors.book_file ? 'border-red-500' : 'border-gray-300'}`}
                  ref={bookFileInputRef}
                />
                {formData.book_file && !newBookFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current file: {formData.book_file.split('/').pop()}
                  </div>
                )}
                {errors.book_file && <p className="text-red-500 text-sm mt-1">{errors.book_file}</p>}
                {editingBook && !newBookFile && (
                  <p className="text-gray-500 text-sm mt-1">Leave empty to keep current file</p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, is_active: e.target.checked }))
                }
                className="mr-2"
                id="is_active"
              />
              <label htmlFor="is_active" className="text-gray-700">Active</label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-green-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingBook ? 'Updating...' : 'Saving...'}
                  </span>
                ) : (
                  editingBook ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {books.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No books found. Add your first book to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={book.cover_image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg=='}
                        alt={`${book.title} cover`}
                        className="h-16 w-12 object-cover rounded border"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{book.title}</div>
                      <div className="text-gray-500 text-sm">{book.language}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.page_count || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatReadingTime(book.reading_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
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
        )}
      </div>
    </div>
  );
};

export default UserBookManagement;