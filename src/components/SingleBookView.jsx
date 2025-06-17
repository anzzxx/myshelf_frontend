import React, { useState, useEffect } from 'react'
import api from "../api/axio"
import { useParams } from 'react-router-dom'

function SingleBookView() {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { book_id } = useParams()

  const BASE_URL = ''

  const fetchBookData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`api/store/book/read/${book_id}/`)
      setBook(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setError("Failed to fetch book details")
      setLoading(false)
    }
  }

  const handleOpenPdf = () => {
    if (book && book.book_file) {
      // Prepend base URL to the PDF file path
      const pdfUrl = `${BASE_URL}${book.book_file}`
      window.open(pdfUrl, '_blank')

      const response=api.patch(`api/store/shelf/update/${book_id}/`,{status:"reading"})
    }
  }

  useEffect(() => {
    fetchBookData()
  }, [book_id])

  if (loading) return <div className="text-center py-8">Loading book details...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>
  if (!book) return <div className="text-center py-8">Book not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover and basic info */}
        <div className="md:flex">
          <div className="md:w-1/3 p-6 flex justify-center">
            {book.cover_image && (
              <img 
                src={`${BASE_URL}${book.cover_image}`} 
                alt={`${book.title} cover`} 
                className="h-64 w-auto object-contain rounded shadow-lg"
              />
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">{book.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-medium">{book.author}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Genre</p>
                <p className="font-medium">{book.genre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Published Date</p>
                <p className="font-medium">{book.published_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium">{book.language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pages</p>
                <p className="font-medium">{book.page_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reading Time</p>
                <p className="font-medium">{book.reading_time} minutes</p>
              </div>
            </div>

            <button 
              onClick={handleOpenPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Open Book
            </button>
          </div>
        </div>

        {/* Additional details */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Status: {book.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-600">
              Last updated: {new Date(book.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleBookView