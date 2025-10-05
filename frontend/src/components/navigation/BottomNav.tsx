import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', route: '/dashboard' },
  { icon: CreditCard, label: 'Cards', route: '/cards' },
  { icon: User, label: 'Profile', route: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-6 mb-5 safe-area-bottom">
      <div className="max-w-md mx-auto px-4">
        {/* Dock Container */}
        <div className="flex items-center justify-center gap-2 mx-auto w-fit px-4 py-3 bg-background/95 backdrop-blur-sm border rounded-full shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route;

            return (
              <Link
                key={item.route}
                to={item.route}
                className={cn(
                  'flex items-center justify-center rounded-full p-3 transition-all duration-200 hover:bg-accent',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

