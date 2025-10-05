import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState<string>("")
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 })
  const tabsRef = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  // Update indicator position when active tab changes
  React.useEffect(() => {
    if (activeTab) {
      const activeElement = tabsRef.current.get(activeTab)
      if (activeElement) {
        const parent = activeElement.parentElement
        if (parent) {
          const parentRect = parent.getBoundingClientRect()
          const activeRect = activeElement.getBoundingClientRect()
          setIndicatorStyle({
            left: activeRect.left - parentRect.left,
            width: activeRect.width,
          })
        }
      }
    }
  }, [activeTab])

  // Clone children to inject refs and track active state
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onTabChange: setActiveTab,
        tabsRef: tabsRef,
      })
    }
    return child
  })

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {/* Animated highlight indicator */}
      {indicatorStyle.width > 0 && (
        <motion.div
          className="absolute h-[calc(100%-0.5rem)] bg-background rounded-sm shadow-sm"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          style={{
            top: "0.25rem",
          }}
        />
      )}
      {enhancedChildren}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  onTabChange?: (value: string) => void
  tabsRef?: React.MutableRefObject<Map<string, HTMLButtonElement>>
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, onTabChange, tabsRef, value, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement>(null)

  // Merge refs
  React.useImperativeHandle(ref, () => innerRef.current!)

  React.useEffect(() => {
    if (innerRef.current && tabsRef && value) {
      tabsRef.current.set(value as string, innerRef.current)
    }
  }, [tabsRef, value])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onTabChange && value) {
      onTabChange(value as string)
    }
    props.onClick?.(e)
  }

  // Detect when this tab becomes active on mount
  React.useEffect(() => {
    const button = innerRef.current
    if (button && onTabChange && value) {
      const observer = new MutationObserver(() => {
        if (button.getAttribute("data-state") === "active") {
          onTabChange(value as string)
        }
      })
      
      // Initial check
      if (button.getAttribute("data-state") === "active") {
        onTabChange(value as string)
      }

      observer.observe(button, {
        attributes: true,
        attributeFilter: ["data-state"],
      })

      return () => observer.disconnect()
    }
  }, [onTabChange, value])

  return (
    <TabsPrimitive.Trigger
      ref={innerRef}
      value={value}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground z-10",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
