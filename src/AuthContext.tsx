import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Owner' | 'Manager' | 'Cashier' | 'Warehouse Staff' | 'Customer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('AFG_CURRENT_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('AFG_CURRENT_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('AFG_CURRENT_USER');
    }
  }, [user]);

  const login = (username: string, role: UserRole) => {
    setUser({ id: `usr-${Date.now()}`, username, fullName: username, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
