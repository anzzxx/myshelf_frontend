"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axio";
import Swal from 'sweetalert2';

// Base64 encoded SVG placeholder
const PLACEHOLDER_COVER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMjAwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==";

export function MyBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchMyShelf();
  }, []);

  const fetchMyShelf = async () => {
    try {
      const response = await api.get('api/store/shelf/');
      console.log(response.data);
      
      const formattedBooks = response.data.data.map(book => ({
        id: book.id,
        bookId: book.book.toString(),
        title: book.book_title,
        author: book.book_author,
        coverImage: `https://myshelf-backend-2.onrender.com${book.book_cover}`,
        addedDate: book.created_at,
        status: book.status,
        started_at: book.started_at,
        finished_at: book.finished_at,
        rating: book.rating,
        notes: book.notes
      }));
      setBooks(formattedBooks);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const navigateToBookDetail = (bookId) => {
    navigate(`/single-book/${bookId}/`);
  };

  const handleRemoveFromShelf = async (shelfId, bookTitle, e) => {
    e.stopPropagation();
    if (removing) return;

    const result = await Swal.fire({
      title: 'Remove from shelf?',
      text: `Are you sure you want to remove "${bookTitle}" from your shelf?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setRemoving(true);
      await api.delete(`api/store/shelf/remove/${shelfId}/`);
      
      setBooks(books.filter(book => book.id !== shelfId));
      
      Swal.fire(
        'Removed!',
        'The book has been removed from your shelf.',
        'success'
      );
      fetchMyShelf()
    } catch (error) {
      console.error("Error removing book from shelf:", error);
      Swal.fire(
        'Error!',
        'There was a problem removing the book from your shelf.',
        'error'
      );
    } finally {
      setRemoving(false);
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === "all") return true;
    return book.status === filter;
  });

  const getStatusDisplay = (status) => {
    switch (status) {
      case "to_read":
        return "To Read";
      case "reading":
        return "Reading";
      case "read":
        return "Read";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "read":
        return "bg-green-100 text-green-800";
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "to_read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">My Books</h1>
        <div className="flex space-x-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/')}
          >
            Add New Book
          </button>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Books</option>
              <option value="read">Read</option>
              <option value="reading">Reading</option>
              <option value="to_read">To Read</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBooks.map((book) => (
          <div 
            key={book.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer relative group"
            onClick={() => navigateToBookDetail(book.bookId)}
          >
            <button
              onClick={(e) => handleRemoveFromShelf(book.bookId, book.title, e)}
              className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
              title="Remove from shelf"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="relative">
              <img 
                src={book.coverImage || PLACEHOLDER_COVER}
                alt={book.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_COVER;
                }}
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(book.status)}`}>
                {getStatusDisplay(book.status)}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{book.author}</p>
              <p className="text-gray-400 text-xs">Added: {new Date(book.addedDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 opacity-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-500">
            {filter === "all" 
              ? "No books in your collection yet" 
              : `No ${filter.replace('_', ' ')} books`}
          </h3>
          <p className="text-gray-400 mb-4">Add your first book to get started</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/')}
          >
            Add New Book
          </button>
        </div>
      )}
    </div>
  );
}