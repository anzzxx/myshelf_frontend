"use client";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export function Layout({ children }) {
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = React.useState([
    { 
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ee2e51cca69ce0dc1be05cb37ba556c9e8e44835?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7", 
      label: "Home", 
      active: true,
      path: "/" 
    },
    { 
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/af13c65a749824e4f41134b019c34d4cd14b868a?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7", 
      label: "Profile", 
      active: false,
      path: "/profile" 
    },
    { 
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/26c71b6d2b73b1a07cc47375bfb2d3aa6171df4e?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7", 
      label: "My Shelf", 
      active: false,
      path: "/shelf" 
    },
    { 
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/131b9e3bd9568a9668c84247833fef42e8aeb0cc?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7", 
      label: "Contribute", 
      active: false,
      path: "/contribute" 
    },
    { 
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/131b9e3bd9568a9668c84247833fef42e8aeb0cc?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7", 
      label: "Genre", 
      active: false,
      path: "/genres" 
    }
  ]);

  const handleMenuItemClick = (clickedIndex, path) => {
    // Update menu items active state
   setMenuItems(
  menuItems.map((item, index) => ({
    ...item,
    active: index === clickedIndex
  }))
);

    
    // Navigate to the selected path
    navigate(path);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex h-full">
        <aside className="w-64 bg-white shadow-md fixed h-full z-10">
          <div className="p-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e0cc3333b902f1d90fa798f16e9329026fa785d1?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7"
              className="w-32"
              alt="Logo"
            />
          </div>
          <nav className="mt-8 px-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(index, item.path)}
                className={`flex items-center w-full py-3 px-4 rounded-lg mb-2 ${
                  item.active ? 'bg-gray-100 text-neutral-600' : 'text-zinc-500 hover:bg-gray-50'
                }`}
              >
                <img src={item.icon} className="w-5 h-5 mr-3" alt="" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 ml-60">
          <div className="bg-gray-100 min-h-screen">
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}