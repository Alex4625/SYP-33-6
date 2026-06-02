import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse border border-black bg-muted dark:border-border", className)}
      {...props}
    />
  )
}

export { Skeleton }
