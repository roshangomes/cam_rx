import React from 'react';
import { Star, Phone, Mail, Calendar, Briefcase, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ServicePersonnel } from '@/store/slices/servicePersonnelSlice';

interface PersonnelCardProps {
  personnel: ServicePersonnel;
  onEdit?: (personnel: ServicePersonnel) => void;
  onDelete?: (id: string) => void;
  onSelect?: (personnel: ServicePersonnel) => void;
  selectable?: boolean;
  selected?: boolean;
}

export const PersonnelCard: React.FC<PersonnelCardProps> = ({
  personnel,
  onEdit,
  onDelete,
  onSelect,
  selectable = false,
  selected = false,
}) => {
  const getAvailabilityBadge = () => {
    switch (personnel.availability) {
      case 'available':
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case 'booked':
        return <Badge variant="secondary">Booked</Badge>;
      case 'unavailable':
        return <Badge variant="outline">Unavailable</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className={`transition-all ${
        selectable ? 'cursor-pointer hover:border-primary' : ''
      } ${selected ? 'border-primary ring-2 ring-primary/20' : ''}`}
      onClick={() => selectable && onSelect?.(personnel)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={personnel.profilePhoto} alt={personnel.name} />
            <AvatarFallback className="text-lg">{getInitials(personnel.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{personnel.name}</h3>
                <p className="text-sm text-muted-foreground">{personnel.role}</p>
              </div>
              {getAvailabilityBadge()}
            </div>

            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">{personnel.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({personnel.totalJobs} jobs)
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {personnel.specializations.slice(0, 3).map(spec => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {personnel.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{personnel.specializations.length - 3}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>₹{personnel.dailyRate}/day</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span>{personnel.experience}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
              {personnel.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {personnel.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && !selectable && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(personnel);
                }}
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(personnel.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
