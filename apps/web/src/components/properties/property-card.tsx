import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PropertyTypeBadge from './property-type-badge'
import PropertyStatusBadge from './property-status-badge'
import { 
  MapPin, 
  Train, 
  Home, 
  Calendar,
  User,
  Eye
} from 'lucide-react'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}億円`
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}万円`
    } else {
      return `${price.toLocaleString()}円`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={property.images[0]?.url || '/placeholder-property.jpg'}
          alt={property.name || property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-[var(--space-sm)] left-[var(--space-sm)] flex gap-[var(--space-xs)]">
          <PropertyTypeBadge type={property.propertyType} />
          <PropertyStatusBadge status={property.status} />
        </div>
      </div>
      
      <CardContent className="flex-1 p-[var(--space-lg)]">
        <div className="space-y-[var(--space-sm)]">
          {/* 物件名・価格 */}
          <div>
            <h3 className="font-[var(--semibold)] text-[var(--text-lg)] text-[var(--ink)] line-clamp-1">
              {property.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-[var(--space-xs)]">
              <span className="text-[var(--text-xl)] font-[var(--semibold)] text-[var(--tint)]">
                {formatPrice(property.price)}
              </span>
              {property.rent && (
                <span className="text-[var(--text-sm)] text-[var(--ink-secondary)]">
                  家賃: {formatPrice(property.rent)}
                </span>
              )}
            </div>
          </div>

          {/* 所在地 */}
          <div className="flex items-start gap-[var(--space-sm)] text-[var(--text-sm)] text-[var(--ink-secondary)]">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{property.address}</span>
          </div>

          {/* 間取り・面積 */}
          <div className="flex items-center gap-[var(--space-md)] text-[var(--text-sm)]">
            <div className="flex items-center gap-[var(--space-xs)]">
              <Home className="w-4 h-4 text-[var(--ink-tertiary)]" />
              <span className="font-[var(--medium)] text-[var(--ink)]">{property.layout}</span>
            </div>
            <span className="text-[var(--ink-secondary)]">{property.area}㎡</span>
          </div>

          {/* 最寄駅 */}
          {property.nearestStation && (
            <div className="flex items-center gap-[var(--space-sm)] text-[var(--text-sm)] text-[var(--ink-secondary)]">
              <Train className="w-4 h-4" />
              <span>
                {property.nearestStation}
                {property.walkingMinutes && ` 徒歩${property.walkingMinutes}分`}
              </span>
            </div>
          )}

          {/* 築年数・構造 */}
          <div className="flex flex-wrap items-center gap-[var(--space-md)] text-[var(--text-xs)] text-[var(--ink-tertiary)]">
            {property.buildingAge !== undefined && (
              <div className="flex items-center gap-[var(--space-xs)]">
                <Calendar className="w-3 h-3" />
                <span>築{property.buildingAge}年</span>
              </div>
            )}
            {property.structure && (
              <span>{property.structure}</span>
            )}
            {property.floor && property.totalFloors && (
              <span>{property.floor}階/{property.totalFloors}階建</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-[var(--space-lg)] pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--space-sm)]">
        <div className="flex flex-wrap items-center gap-[var(--space-sm)] text-[var(--text-xs)] text-[var(--ink-tertiary)]">
          {property.assignedTo && (
            <div className="flex items-center gap-[var(--space-xs)]">
              <User className="w-3 h-3" />
              <span>{property.assignedTo}</span>
            </div>
          )}
          <span>更新: {formatDate(property.updatedAt)}</span>
        </div>
        
        <div className="flex gap-[var(--space-sm)]">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/properties/${property.id}`}>
              <Eye className="w-4 h-4 mr-[var(--space-xs)]" />
              詳細
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}