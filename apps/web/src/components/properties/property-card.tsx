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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={property.images[0]?.url || '/placeholder-property.jpg'}
            alt={property.name || property.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <PropertyTypeBadge type={property.propertyType} />
            <PropertyStatusBadge status={property.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 物件名・価格 */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(property.price)}
              </span>
              {property.rent && (
                <span className="text-sm text-gray-600">
                  家賃: {formatPrice(property.rent)}
                </span>
              )}
            </div>
          </div>

          {/* 所在地 */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{property.address}</span>
          </div>

          {/* 間取り・面積 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{property.layout}</span>
            </div>
            <span className="text-gray-600">{property.area}㎡</span>
          </div>

          {/* 最寄駅 */}
          {property.nearestStation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Train className="w-4 h-4" />
              <span>
                {property.nearestStation}
                {property.walkingMinutes && ` 徒歩${property.walkingMinutes}分`}
              </span>
            </div>
          )}

          {/* 築年数・構造 */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {property.buildingAge !== undefined && (
              <div className="flex items-center gap-1">
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

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {property.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{property.assignedTo}</span>
            </div>
          )}
          <span>更新: {formatDate(property.updatedAt)}</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/properties/${property.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              詳細
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}