
import api from '../api/axio'; 
import Swal from 'sweetalert2';

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh');
    console.log(refreshToken);
    
    if (refreshToken) {
      await api.post('api/logout/', {
        refresh_token: refreshToken
      });
    }

    // Clear all auth data
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');

    // Redirect to login
    window.location.href = '/';

    // Show success message
    Swal.fire('Logged Out', 'You have been successfully logged out.', 'success');
  } catch (error) {
    console.error("Logout error:", error);
    
    // Force logout even if API fails
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';

    if (!error.message.includes('Network Error')) {
      Swal.fire('Error', 'There was an issue during logout.', 'error');
    }
  }
};