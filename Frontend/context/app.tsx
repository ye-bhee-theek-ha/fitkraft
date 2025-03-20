import { User, UserProfile } from '@/constants/types';
import React, { createContext, useState, useEffect } from 'react';

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  jwt: string | null;
  setJwt: React.Dispatch<React.SetStateAction<string | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);


  return (
    <AppContext.Provider value={{ user, setUser, jwt, setJwt }}>
      {children}
    </AppContext.Provider>
  );
};
