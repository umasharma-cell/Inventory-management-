import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setNotifications((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setNotifications((items) => items.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {notifications.map((item) => {
          const Icon = item.type === 'error' ? XCircle : CheckCircle2;
          return (
            <div className={`toast toast-${item.type}`} key={item.id}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.message}</span>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return context;
}
