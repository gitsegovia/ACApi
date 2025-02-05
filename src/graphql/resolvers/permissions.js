import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';
import { hasRole } from '../utils/roles';
import ProtectedRoute from '../../components/ProtectedRoute';

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

export const ROLES = {
    ADMIN: 'administrator',
    ADMIN: 'Manager',
    USER: 'users',
  };
  
  export const hasRole = (user, role) => {
    return user && user.roles && user.roles.includes(role);
  };




const AdminDashboard = () => {
  return (
    <ProtectedRoute roles={[ROLES.ADMIN]}>
      <h1>Panel de administración</h1>
      {}
    </ProtectedRoute>
  );
};

export default AdminDashboard;




const Profile = () => {
  return (
    <ProtectedRoute>
      <h1>Mi perfil</h1>
      {}
    </ProtectedRoute>
  );
};

export default Profile;




const Users = () => {
  return (
    <ProtectedRoute roles={[ROLES.ADMIN]}>
      <h1>Gestión de usuarios</h1>
      {/* Contenido para gestionar usuarios */}
    </ProtectedRoute>
  );
};

export default Users;