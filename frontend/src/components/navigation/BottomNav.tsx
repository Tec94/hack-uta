import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CreditCard, User, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { icon: Home, label: 'Home', route: '/dashboard' },
  { icon: CreditCard, label: 'Cards', route: '/cards' },
  { icon: ArrowRightLeft, label: 'Transfers', route: '/transfer-rates' },
  { icon: User, label: 'Profile', route: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Update indicator position when route changes
  useEffect(() => {
    const activeItem = navRefs.current.get(pathname);
    const container = containerRef.current;
    
    if (activeItem && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeItem.getBoundingClientRect();
      
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-6 mb-5 safe-area-bottom">
      <div className="max-w-md mx-auto px-4">
        {/* Dock Container */}
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center gap-2 mx-auto w-fit px-4 py-3 bg-background/95 backdrop-blur-sm border rounded-full shadow-lg"
        >
          {/* Animated highlight indicator */}
          {indicatorStyle.width > 0 && (
            <motion.div
              className="absolute bg-primary rounded-full"
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                height: indicatorStyle.width, // Make it square/circular
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            />
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.route;

            return (
              <Link
                key={item.route}
                to={item.route}
                ref={(el) => {
                  if (el) {
                    navRefs.current.set(item.route, el);
                  }
                }}
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-full p-3 transition-all duration-200 hover:bg-accent',
                  isActive && 'text-primary-foreground'
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

