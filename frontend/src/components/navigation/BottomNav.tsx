import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', route: '/dashboard' },
  { icon: CreditCard, label: 'For You', route: '/recommendations' },
  { icon: Plus, label: 'Add', route: '#', disabled: true },
  { icon: User, label: 'Profile', route: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-20 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;
          const isDisabled = item.disabled;

          return (
            <Link
              key={item.route}
              to={isDisabled ? '#' : item.route}
              className={cn(
                'flex flex-col items-center justify-center gap-1 touch-target flex-1 transition-colors',
                {
                  'text-primary': isActive && !isDisabled,
                  'text-gray-500 hover:text-gray-700': !isActive && !isDisabled,
                  'text-gray-300 cursor-not-allowed': isDisabled,
                }
              )}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

