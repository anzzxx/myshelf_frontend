"use client";
import * as React from "react";
import { Layout } from "../components/Layout";
import { ContentSection } from "../components/ContentSection";
import api from "../api/axio";

export default function Home() {
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchBooks = async () => {
    try {
      const response = await api.get('api/store/books/');
      setBooks(response.data.results); // Assuming your API returns { results: [...] }
      
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBooks();
  }, []);

  // Transform API data to match your BookCard component's expected format
  const transformBookData = (apiBooks) => {
    return apiBooks.map(book => ({
      id: book.id,
      image: book.cover_image, // Using cover_image from API
      title: book.title,
      author: book.author, // Note: Your API shows author as number (3), you might need to fetch author name separately
      rating: "4.5/5", // Default rating or fetch from API if available
      description: book.description,
      readingTime: book.reading_time,
      fileUrl: book.book_file
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading books...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>Error loading books: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ContentSection recommendedBooks={transformBookData(books)} />
    </Layout>
  );
}