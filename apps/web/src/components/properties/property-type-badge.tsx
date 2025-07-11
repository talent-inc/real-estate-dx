import { Badge } from '@/components/ui/badge'
import { PropertyType, PROPERTY_TYPE_LABELS } from '@/types/property'
import { Building, Home, Mountain, Briefcase, Store } from 'lucide-react'

interface PropertyTypeBadgeProps {
  type: PropertyType
  showIcon?: boolean
}

const typeConfig: any = {
  APARTMENT: { 
    variant: 'info' as const, 
    icon: Building,
    color: 'bg-cyan-500 hover:bg-cyan-600'
  },
  HOUSE: { 
    variant: 'success' as const, 
    icon: Home,
    color: 'bg-green-500 hover:bg-green-600'
  },
  LAND: { 
    variant: 'warning' as const, 
    icon: Mountain,
    color: 'bg-amber-600 hover:bg-amber-700'
  },
  OFFICE: { 
    variant: 'secondary' as const, 
    icon: Briefcase,
    color: 'bg-gray-500 hover:bg-gray-600'
  },
  STORE: { 
    variant: 'outline' as const, 
    icon: Store,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  // 後方互換性
  apartment: { 
    variant: 'info' as const, 
    icon: Building,
    color: 'bg-cyan-500 hover:bg-cyan-600'
  },
  mansion: { 
    variant: 'default' as const, 
    icon: Building,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  house: { 
    variant: 'success' as const, 
    icon: Home,
    color: 'bg-green-500 hover:bg-green-600'
  },
  land: { 
    variant: 'warning' as const, 
    icon: Mountain,
    color: 'bg-amber-600 hover:bg-amber-700'
  },
  office: { 
    variant: 'secondary' as const, 
    icon: Briefcase,
    color: 'bg-gray-500 hover:bg-gray-600'
  },
  shop: { 
    variant: 'outline' as const, 
    icon: Store,
    color: 'bg-purple-500 hover:bg-purple-600'
  }
}

export default function PropertyTypeBadge({ type, showIcon = true }: PropertyTypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} text-white border-0`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {PROPERTY_TYPE_LABELS[type]}
    </Badge>
  )
}