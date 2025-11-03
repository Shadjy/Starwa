import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardCard({ title, description, icon, children, className }: DashboardCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#8b7355]">{icon}</div>}
          <div>
            <CardTitle className="text-[#2c2416]">{title}</CardTitle>
            {description && <CardDescription className="text-[#6b5d4f]">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
