import { Badge } from '@/components/ui/badge'
import { PropertyStatus, PROPERTY_STATUS_LABELS } from '@/types/property'
import { 
  Eye, 
  MessageCircle, 
  FileCheck, 
  CheckCircle, 
  Clock 
} from 'lucide-react'

interface PropertyStatusBadgeProps {
  status: PropertyStatus
  showIcon?: boolean
}

const statusConfig = {
  ACTIVE: { 
    variant: 'success' as const, 
    icon: Eye,
    color: 'bg-green-500 hover:bg-green-600'
  },
  PENDING: { 
    variant: 'warning' as const, 
    icon: Clock,
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  SOLD: { 
    variant: 'secondary' as const, 
    icon: CheckCircle,
    color: 'bg-gray-500 hover:bg-gray-600'
  },
  SUSPENDED: { 
    variant: 'outline' as const, 
    icon: MessageCircle,
    color: 'bg-red-500 hover:bg-red-600'
  }
}

export default function PropertyStatusBadge({ status, showIcon = true }: PropertyStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} text-white border-0`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {PROPERTY_STATUS_LABELS[status]}
    </Badge>
  )
}