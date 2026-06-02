import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drop, incrementDropViews } from '@/services/drops'
import { getDriveEmbedUrl, getDriveViewUrl, formatDuration } from '@/lib/drive-utils'

interface DropPlayerDialogProps {
  drop: Drop
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DropPlayerDialog({ drop, open, onOpenChange }: DropPlayerDialogProps) {
  const [viewTracked, setViewTracked] = useState(false)

  useEffect(() => {
    if (open && drop.id && !viewTracked) {
      incrementDropViews(drop.id).catch(() => {})
      setViewTracked(true)
    }
  }, [open, drop.id, viewTracked])

  // Reset tracking when drop changes
  useEffect(() => {
    setViewTracked(false)
  }, [drop.id])

  const embedUrl = getDriveEmbedUrl(drop.video_url || drop.video_id)
  const viewUrl = getDriveViewUrl(drop.video_url || drop.video_id) || drop.video_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 text-white border-brand-border">
        <DialogHeader className="sr-only">
          <DialogTitle>{drop.title}</DialogTitle>
          <DialogDescription>{drop.description || 'Drop video player'}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-[90vh]">
          <div className="relative w-full aspect-video bg-black flex-shrink-0">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Vídeo não disponível
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {drop.expand?.category && (
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 border-0"
                  >
                    {drop.expand.category.label}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(drop.duration_seconds)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{(drop.views || 0) + (viewTracked ? 1 : 0)} visualizações</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-2">{drop.title}</h2>
                {drop.description && (
                  <p className="text-gray-400 leading-relaxed">{drop.description}</p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  asChild
                  className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Google Drive
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
