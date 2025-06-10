"use client";
import * as React from "react";
import api from "../api/axio";
import Swal from 'sweetalert2';

export function BookCard({ 
  image, 
  title, 
  author, 
  rating, 
  showRating = false, 
  className = "",
  description,
  readingTime,
  onClick,
  onAddToShelf,
  book_id
}) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);
  

  const formatReadingTime = (seconds) => {
    if (!seconds) return null;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min read`;
  };

  const imageUrl = image || '/placeholder-book-cover.jpg';
  
  const handleAddToShelf = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to add books to your shelf',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    addToMYshelf();
  };

  const addToMYshelf = async () => {
    try {
      const response = await api.post('api/store/shelf/add/', { book: book_id });
      
      Swal.fire({
        title: 'Success!',
        text: 'Book has been added to your shelf',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });
      
      if (onAddToShelf) {
        onAddToShelf();
      }
      
    } catch (error) {
      let errorMessage = 'Failed to add book to shelf';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      
      console.error('Error adding to shelf:', error);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={title || "Book cover"}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-book-cover.jpg';
          }}
        />
        
        {/* Only show Add to Shelf button if authenticated */}
        {isClient && isAuthenticated && (
          <button 
            onClick={handleAddToShelf}
            className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
            aria-label="Add to shelf"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate" title={title}>
          {title || "Untitled Book"}
        </h3>
        <p className="text-gray-600 text-sm mb-2 truncate" title={author}>
          {author || "Unknown Author"}
        </p>
        
        {showRating && rating && (
          <div className="flex items-center mb-2">
            <div className="text-black text-sm">
              <span className="text-gray-800 font-medium">{rating.split('/')[0]}</span>
              <span className="text-gray-400">/{rating.split('/')[1]}</span>
            </div>
            {readingTime && (
              <span className="ml-2 text-xs text-gray-400">
                {formatReadingTime(readingTime)}
              </span>
            )}
          </div>
        )}
        
        {description && (
          <p className="text-gray-500 text-sm line-clamp-2" title={description}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}