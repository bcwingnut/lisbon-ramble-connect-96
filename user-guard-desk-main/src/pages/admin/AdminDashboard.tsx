import { useEffect, useState } from "react";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  linkedin_url?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserDeleted = () => {
    fetchUsers(); // Refresh the user list
  };

  // Calculate stats
  const totalUsers = users.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newUsersThisMonth = users.filter(user => {
    const userDate = new Date(user.created_at);
    return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitor and manage your application's user base
        </p>
      </div>

      <AdminStats 
        totalUsers={totalUsers}
        newUsersThisMonth={newUsersThisMonth}
        loading={loading}
      />

      <UserTable 
        users={users}
        onUserDeleted={handleUserDeleted}
        loading={loading}
      />
    </div>
  );
}