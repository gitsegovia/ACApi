import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
};

//

export const ROLES = {
    ADMIN: 'administrator',
    ADMIN: 'Manager',
    USER: 'users',
  };
  



  export const hasRole = (user, role) => {
    return user && user.roles && user.roles.includes(role);
  };


  import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';
import { hasRole } from '../utils/roles';

const ProtectedRoute = ({ children, roles }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    router.push('/login'); 
    return null;
  }

  if (roles && !roles.some((role) => hasRole(user, role))) {
    router.push('/unauthorized'); 
    return null;
  }

  return children;
};

export default ProtectedRoute;

//

