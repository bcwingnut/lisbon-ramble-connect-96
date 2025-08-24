import { Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatsProps {
  totalUsers: number;
  newUsersThisMonth: number;
  loading?: boolean;
}

export function AdminStats({ totalUsers, newUsersThisMonth, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered accounts",
      icon: Users,
      color: "text-admin-primary",
    },
    {
      title: "New This Month",
      value: newUsersThisMonth,
      description: "Recent registrations",
      icon: UserPlus,
      color: "text-admin-success",
    },
    {
      title: "Growth Rate",
      value: totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0,
      description: "% increase this month",
      icon: TrendingUp,
      color: "text-admin-secondary",
      suffix: "%",
    },
    {
      title: "Active Today",
      value: Math.floor(totalUsers * 0.3), // Mock data
      description: "Users logged in today",
      icon: Calendar,
      color: "text-admin-warning",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}{stat.suffix || ""}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}