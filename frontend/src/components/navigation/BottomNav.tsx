import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, CreditCard, User, ArrowRightLeft, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { icon: Home, label: "Home", route: "/dashboard" },
  { icon: CreditCard, label: "Cards", route: "/cards" },
  { icon: ArrowRightLeft, label: "Transfers", route: "/transfer-rates" },
  { icon: Wallet, label: "Budget", route: "/budget" },
  { icon: User, label: "Profile", route: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [animatingRoute, setAnimatingRoute] = useState<string | null>(null);
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
    
    // Trigger animation for the new active route
    setAnimatingRoute(pathname);
    
    // Reset animation state after animation completes
    const timer = setTimeout(() => {
      setAnimatingRoute(null);
    }, 600);
    
    return () => clearTimeout(timer);
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
            const shouldAnimate = animatingRoute === item.route;

            return (
              <motion.div
                key={item.route}
                animate={{ 
                  scale: shouldAnimate ? [1, 1.2, 0.95, 1] : 1 
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                }}
              >
                <Link
                  to={item.route}
                  ref={(el) => {
                    if (el) {
                      navRefs.current.set(item.route, el);
                    }
                  }}
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-full p-3 transition-all duration-200",
                    !isActive && "hover:bg-accent",
                    isActive && "text-primary-foreground"
                  )}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
