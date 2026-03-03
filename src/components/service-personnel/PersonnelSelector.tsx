import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RootState } from '@/store/store';
import { ServicePersonnel } from '@/store/slices/servicePersonnelSlice';
import { PersonnelCard } from './PersonnelCard';

interface PersonnelSelectorProps {
  selectedPersonnel: ServicePersonnel[];
  onSelectionChange: (personnel: ServicePersonnel[]) => void;
  maxSelection?: number;
}

export const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  selectedPersonnel,
  onSelectionChange,
  maxSelection = 5,
}) => {
  const { personnel } = useSelector((state: RootState) => state.servicePersonnel);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const availablePersonnel = personnel.filter(p => p.availability === 'available');

  const filteredPersonnel = availablePersonnel.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(personnel.map(p => p.role))];

  const toggleSelection = (person: ServicePersonnel) => {
    const isSelected = selectedPersonnel.some(p => p.id === person.id);
    
    if (isSelected) {
      onSelectionChange(selectedPersonnel.filter(p => p.id !== person.id));
    } else if (selectedPersonnel.length < maxSelection) {
      onSelectionChange([...selectedPersonnel, person]);
    }
  };

  const totalServiceCost = selectedPersonnel.reduce((sum, p) => sum + p.dailyRate, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Add Service Personnel
        </CardTitle>
        <CardDescription>
          Select service team members to add to this booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
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

        {/* Selected Personnel Summary */}
        {selectedPersonnel.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Selected ({selectedPersonnel.length}/{maxSelection})
              </span>
              <span className="font-semibold text-primary">
                ₹{totalServiceCost}/day
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPersonnel.map(p => (
                <Badge
                  key={p.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleSelection(p)}
                >
                  {p.name} - {p.role}
                  <Check className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Personnel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {filteredPersonnel.map(person => (
            <PersonnelCard
              key={person.id}
              personnel={person}
              selectable
              selected={selectedPersonnel.some(p => p.id === person.id)}
              onSelect={toggleSelection}
            />
          ))}
        </div>

        {filteredPersonnel.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No available personnel found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
