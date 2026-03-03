import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RootState } from '@/store/store';
import { deletePersonnel, setSearchTerm, setRoleFilter } from '@/store/slices/servicePersonnelSlice';
import { PersonnelCard } from '@/components/service-personnel/PersonnelCard';
import { AddPersonnelForm } from '@/components/service-personnel/AddPersonnelForm';
import { toast } from '@/hooks/use-toast';

const ServicePersonnelPage: React.FC = () => {
  const dispatch = useDispatch();
  const { personnel, searchTerm, roleFilter } = useSelector((state: RootState) => state.servicePersonnel);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const uniqueRoles = [...new Set(personnel.map(p => p.role))];

  const filteredPersonnel = personnel.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deletePersonnel(deleteId));
      toast({
        title: 'Personnel removed',
        description: 'Service personnel has been removed from your team',
      });
      setDeleteId(null);
    }
  };

  const stats = {
    total: personnel.length,
    available: personnel.filter(p => p.availability === 'available').length,
    booked: personnel.filter(p => p.availability === 'booked').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Service Personnel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your service team members
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Personnel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Personnel</p>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.available}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.booked}</p>
          <p className="text-sm text-muted-foreground">Currently Booked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or specialization..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => dispatch(setRoleFilter(value))}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {uniqueRoles.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map(person => (
          <PersonnelCard
            key={person.id}
            personnel={person}
            onEdit={(p) => {
              toast({
                title: 'Edit functionality',
                description: 'Edit feature coming soon',
              });
            }}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No personnel found</p>
          <Button variant="link" onClick={() => setShowAddDialog(true)}>
            Add your first team member
          </Button>
        </div>
      )}

      {/* Add Personnel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Personnel</DialogTitle>
          </DialogHeader>
          <AddPersonnelForm
            onSuccess={() => setShowAddDialog(false)}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Personnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicePersonnelPage;
