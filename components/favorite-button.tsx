'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { toggleFavorite } from '@/app/dashboard/history/[id]/actions'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  reviewId: string
  initialIsFavorite: boolean
}

export function FavoriteButton({ reviewId, initialIsFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const res = await toggleFavorite(reviewId)
    setIsLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else if (res.success) {
      setIsFavorite(!!res.isFavorite)
      toast.success(res.isFavorite ? 'Added to favorites' : 'Removed from favorites')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className="rounded-full bg-background"
    >
      <Star 
        className={`h-4 w-4 transition-all duration-300 ${
          isFavorite ? 'fill-yellow-500 text-yellow-500 scale-110' : 'text-muted-foreground'
        }`} 
      />
      <span className="sr-only">Favorite review</span>
    </Button>
  )
}
