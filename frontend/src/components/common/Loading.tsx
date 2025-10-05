import { Loader2 } from 'lucide-react'

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <img 
          src="/credify-logo.png" 
          alt="Credify" 
          className="w-24 h-24 mx-auto mb-6 object-contain animate-pulse"
        />
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

