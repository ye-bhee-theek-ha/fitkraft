import React, { createContext, useState, useEffect } from 'react';

const AppContext = createContext<undefined>(undefined);

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);


  return (
    <AppContext.Provider value={{ students, teachers, classes, setStudents, setTeachers, setClasses}}>
      {children}
    </AppContext.Provider>
  );
};
