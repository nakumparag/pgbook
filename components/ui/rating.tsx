import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  max?: number
  size?: number
  readOnly?: boolean
  onChange?: (value: number) => void
}

export function Rating({
  value,
  max = 5,
  size = 16,
  readOnly = true,
  onChange,
  className,
  ...props
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
      {...props}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const isFilled = hoverValue !== null ? starValue <= hoverValue : starValue <= value

        return (
          <Star
            key={i}
            size={size}
            className={cn(
              "transition-colors",
              isFilled ? "fill-warning text-warning" : "fill-muted text-muted-foreground",
              !readOnly && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
          />
        )
      })}
    </div>
  )
}
