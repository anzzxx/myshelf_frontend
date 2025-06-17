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
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newBookFile, setNewBookFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      // const response = await api.get('api/store/genre/');
      const response = await api.get('api/store/genres/');
      // console.log(responses.data,"globel scope");
      // console.log(response.data,"local scope");
      
      
      setGenres(response.data.results);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverFile(file);
      setFormData(prev => ({ ...prev, cover_image: URL.createObjectURL(file) }));
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBookFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      }

      if (newBookFile) {
        formDataToSend.append('book_file', newBookFile);
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
      Swal.fire('Error!', 'There was a problem saving the book.', 'error');
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Management</h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Add New Book
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h2>
          <form onSubmit={handleSubmit}>
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
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Page Count</label>
                <input
                  type="number"
                  name="page_count"
                  value={formData.page_count}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Reading Time (minutes)</label>
                <input
                  type="number"
                  name="reading_time"
                  value={formData.reading_time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Published Date</label>
                <input
                  type="date"
                  name="published_date"
                  value={formData.published_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Genre*</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Cover Image</label>
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="w-full p-2 border rounded"
                  ref={coverInputRef}
                />
                {(formData.cover_image || newCoverFile) && (
                  <img
                    src={formData.cover_image}
                    alt="Cover preview"
                    className="mt-2 h-24 w-24 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Book File (PDF)</label>
                <input
                  type="file"
                  name="book_file"
                  accept=".pdf"
                  onChange={handleBookFileChange}
                  className="w-full p-2 border rounded"
                  ref={bookFileInputRef}
                />
                {formData.book_file && !newBookFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current file: {formData.book_file.split('/').pop()}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="mr-2"
                />
                <span className="text-gray-700">Active</span>
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
                {editingBook ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reading Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`http://127.0.0.1:8000/${book.cover_image}` || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg=='}
                    alt={`${book.title} cover`}
                    className="h-16 w-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <div className="text-gray-900">{book.title}</div>
                  <div className="text-gray-500 text-sm">{book.language}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{book.page_count || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatReadingTime(book.reading_time)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {book.is_active ? (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
    </div>
  );
};

export default UserBookManagement;