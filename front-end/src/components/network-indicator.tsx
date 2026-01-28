import { Badge } from "@/components/ui/badge"
import { type NetworkType, getNetworkConfig } from "@/lib/networks"

interface NetworkIndicatorProps {
  network: NetworkType
}

export function NetworkIndicator({ network }: NetworkIndicatorProps) {
  const config = getNetworkConfig(network)

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
