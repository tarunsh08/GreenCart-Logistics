import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token in the default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token with backend
          const res = await axios.get('http://localhost:3000/api/auth/me');
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { username, password });
      
      if (res.data.token) {
        // Store the token
        localStorage.setItem('token', res.data.token);
        
        // Set the token in axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Set user data
        setUser(res.data.user);
        
        // Navigate to dashboard
        navigate('/dashboard');
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'No authentication token received' 
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/signup', userData);
      
      if (res.data.token) {
        // Store the token
        localStorage.setItem('token', res.data.token);
        
        // Set the token in axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Set user data
        setUser(res.data.user);
        
        // Navigate to dashboard
        navigate('/dashboard');
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'No authentication token received' 
      };
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove the token from axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
