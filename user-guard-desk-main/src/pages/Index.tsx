import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-admin-primary/10 text-admin-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            User Management
            <br />
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Efficiently manage your application's users with our comprehensive admin dashboard. 
            View, search, and manage user accounts with ease.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-admin-primary hover:bg-admin-primary/90 gap-2">
              <Link to="/admin">
                Access Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-admin-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users in your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Search and filter users</li>
                <li>• Delete user accounts</li>
                <li>• Export user data</li>
                <li>• View user profiles</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-admin-secondary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Monitor user growth and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Total user count</li>
                <li>• Monthly growth rate</li>
                <li>• Active user tracking</li>
                <li>• Registration trends</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-admin-success mb-2" />
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Secure admin controls and user data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Role-based access</li>
                <li>• Data encryption</li>
                <li>• Audit logging</li>
                <li>• Secure operations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
