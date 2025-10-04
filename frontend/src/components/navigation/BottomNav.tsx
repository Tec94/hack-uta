import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 safe-area-bottom shadow-lg">
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
                'relative flex flex-col items-center justify-center gap-1 touch-target flex-1 transition-all',
                {
                  'text-primary': isActive && !isDisabled,
                  'text-gray-500 hover:text-gray-700': !isActive && !isDisabled,
                  'text-gray-300 cursor-not-allowed': isDisabled,
                }
              )}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              {isActive && !isDisabled && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative p-2 rounded-xl transition-all",
                {
                  'scale-110': isActive && !isDisabled,
                }
              )}>
                {isActive && !isDisabled && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-10"></div>
                )}
                <Icon className="w-6 h-6 relative z-10" />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all",
                {
                  'font-bold': isActive && !isDisabled,
                }
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

