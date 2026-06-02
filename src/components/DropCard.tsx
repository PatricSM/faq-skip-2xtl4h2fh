import { Drop } from '@/services/drops'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle } from 'lucide-react'
import { getDriveThumbnailUrl, formatDuration } from '@/lib/drive-utils'

interface DropCardProps {
  drop: Drop
  onClick: () => void
}

export function DropCard({ drop, onClick }: DropCardProps) {
  const thumbnailUrl =
    drop.thumbnail_url ||
    getDriveThumbnailUrl(drop.video_url || drop.video_id, 'w640') ||
    'https://img.usecurling.com/p/640/360?q=video&color=gray'

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:border-brand-primary/50 transition-colors"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={drop.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              `https://img.usecurling.com/p/640/360?q=video&color=gray`
          }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <PlayCircle className="w-16 h-16 text-white scale-75 group-hover:scale-100 transition-transform duration-300" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded">
          {formatDuration(drop.duration_seconds)}
        </div>
      </div>
      <CardContent className="p-4">
        {drop.expand?.category && (
          <Badge variant="secondary" className="mb-2">
            {drop.expand.category.label}
          </Badge>
        )}
        <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors">
          {drop.title}
        </h3>
        {drop.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{drop.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
