import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, UserPlus, Shield, UserCheck, Settings, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'inactive';
  department: string;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'driver', status: 'active', department: 'Transport' },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'camera_crew', status: 'active', department: 'Camera' },
  { id: '3', name: 'Amit Patel', email: 'amit@example.com', role: 'driver', status: 'invited', department: 'Transport' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'camera_crew', status: 'active', department: 'Camera' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'driver', status: 'inactive', department: 'Transport' },
];

const availableRoles = [
  { value: 'driver', label: 'Driver' },
  { value: 'camera_crew', label: 'Camera Crew' },
  { value: 'vendor', label: 'Vendor (Admin)' },
];

const VendorDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [team] = useState<TeamMember[]>(mockTeam);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const stats = {
    total: team.length,
    active: team.filter(m => m.status === 'active').length,
    invited: team.filter(m => m.status === 'invited').length,
    inactive: team.filter(m => m.status === 'inactive').length,
  };

  const handleRoleChange = () => {
    if (editingMember && selectedRole) {
      toast.success(`Role updated to "${selectedRole}" for ${editingMember.name}`);
      setEditingMember(null);
      setSelectedRole('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'invited':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Invited</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'driver':
        return <Badge variant="outline" className="border-primary/30 text-primary">Driver</Badge>;
      case 'camera_crew':
        return <Badge variant="outline" className="border-primary/30 text-primary">Camera Crew</Badge>;
      case 'vendor':
        return <Badge variant="outline" className="border-primary/30 text-primary">Vendor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.name || 'Vendor'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your team members and assign roles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invited</CardTitle>
            <UserPlus className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.invited}</div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members with Role Assignment */}
      <Card className="shadow-soft bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Members
          </CardTitle>
          <CardDescription>
            View and manage roles for your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background shadow-soft"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.department} Department</p>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  {getStatusBadge(member.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMember(member);
                      setSelectedRole(member.role);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role – {editingMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current role: <strong>{editingMember?.role}</strong></p>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboardPage;
