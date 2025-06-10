"use client";
import * as React from "react";
import { BookCard } from "./BookCard";
// import { useRouter } from "next/navigation";
import { useNavigate } from "react-router-dom";

export function ContentSection({ recommendedBooks }) {
  // const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const navigate=useNavigate()
  React.useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogin = () => {
    navigate('/login')
  };

  const handleSignUp = () => {
    navigate('/signup')
  };

  

  return (
    <div className="w-full max-w-[960px] mx-auto px-5 py-8">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}
          {isClient && !isAuthenticated && (
            <span className="text-sm ml-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Guest Mode
            </span>
          )}
        </h1>
        <p className="text-gray-600">Discover your next favorite read</p>
        
        {isClient && !isAuthenticated && (
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={handleSignUp}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Rest of your existing content remains the same */}
      {/* Quote and Featured Books Row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        {/* Quote Card */}
        <div className="w-full lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Today's Quote</h2>
          <blockquote className="text-lg italic mb-6 leading-relaxed">
            "There is more treasure in books than in all the pirate's loot on Treasure Island."
          </blockquote>
          <div className="flex justify-between items-end">
            <cite className="text-white/90">— Walt Disney</cite>
            <div className="flex gap-2">
              {[true, false, false, false].map((active, i) => (
                <span 
                  key={i}
                  className={`block w-2 h-2 rounded-full transition-all ${active ? 'bg-white w-4' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Featured Books */}
        <div className="w-full lg:w-3/5">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">Featured Books</h3>
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}>
              <div className="flex gap-5 w-max">
                {recommendedBooks.slice(0, 5).map((book) => (
                  <div key={book.id} className="w-48 flex-shrink-0">
                    <BookCard
                      image={book.image}
                      title={book.title}
                      author={book.author}
                      rating={book.rating}
                      book_id={book.id}
                      showRating={true}
                      onClick={()=>navigate(`/single-book/${book.id}/`)}
                      className="hover:shadow-md transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Recommended Books Section */}
      <section className="mb-14">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
            View all <span className="ml-1">→</span>
          </button>
        </div>
        
        <div className="relative">
          <div 
            className="overflow-x-auto pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            <div className="flex gap-5 w-max">
              {recommendedBooks.map((book) => (
                <div key={book.id} className="w-52 flex-shrink-0">
                  <BookCard
                    image={book.image}
                    title={book.title}
                    author={book.author}
                    rating={book.rating}
                    showRating={true}
                    book_id={book.id}
                    onClick={()=>navigate(`/single-book/${book.id}/`)}
                    className="border border-gray-100 hover:border-blue-100 hover:shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}