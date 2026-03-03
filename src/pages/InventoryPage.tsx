import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  Eye,
  AlertCircle,
  Camera,
  Lightbulb,
  Mic,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RootState } from '@/store/store';
import { setSearchTerm, setCategoryFilter, deleteEquipment, Equipment } from '@/store/slices/inventorySlice';
import { toast } from 'sonner';

// Mock video production equipment data
const mockEquipment = [
  {
    id: '1',
    name: 'Canon EOS R5',
    brand: 'Canon',
    model: 'EOS R5',
    category: 'cameras' as const,
    subcategory: 'Mirrorless Camera',
    description: 'Professional full-frame mirrorless camera with 8K video recording',
    dailyRate: 1200,
    weeklyRate: 7000,
    availability: 'available' as const,
    images: [],
    specifications: { 
      sensor: '45MP Full Frame', 
      video: '8K RAW, 4K 120p', 
      iso: '100-51200',
      mount: 'RF Mount' 
    },
    condition: 'excellent' as const,
    yearPurchased: '2023',
    serialNumber: 'CR5001234',
    accessories: ['Battery Grip', 'CFexpress Card', 'Battery x2'],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Sony FX30',
    brand: 'Sony',
    model: 'FX30',
    category: 'cameras' as const,
    subcategory: 'Cinema Camera',
    description: 'Compact cinema camera with APS-C sensor',
    dailyRate: 800,
    weeklyRate: 4500,
    availability: 'rented' as const,
    images: [],
    specifications: { 
      sensor: 'APS-C CMOS', 
      video: '4K 120p', 
      iso: '100-32000',
      mount: 'E Mount' 
    },
    condition: 'excellent' as const,
    yearPurchased: '2023',
    serialNumber: 'FX3001234',
    accessories: ['Top Handle', 'V-Mount Battery', 'Monitor'],
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Canon RF 24-70mm f/2.8L',
    brand: 'Canon',
    model: 'RF 24-70mm f/2.8L IS USM',
    category: 'lenses' as const,
    subcategory: 'Zoom Lens',
    description: 'Professional standard zoom lens with image stabilization',
    dailyRate: 300,
    weeklyRate: 1800,
    availability: 'available' as const,
    images: [],
    specifications: { 
      mount: 'Canon RF', 
      aperture: 'f/2.8', 
      stabilization: '5-stop IS',
      weight: '900g' 
    },
    condition: 'excellent' as const,
    yearPurchased: '2023',
    serialNumber: 'RF2470001',
    accessories: ['Lens Hood', 'UV Filter', 'Lens Case'],
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'ARRI SkyPanel S60-C',
    brand: 'ARRI',
    model: 'SkyPanel S60-C',
    category: 'lighting' as const,
    subcategory: 'LED Panel',
    description: 'Color-tunable LED softlight with full spectrum control',
    dailyRate: 450,
    weeklyRate: 2500,
    availability: 'available' as const,
    images: [],
    specifications: { 
      power: '400W', 
      color: 'Full RGB+W', 
      beam: '115° x 55°',
      control: 'DMX, RDM, Ethernet' 
    },
    condition: 'excellent' as const,
    yearPurchased: '2022',
    serialNumber: 'AS60001234',
    accessories: ['Softbox', 'Honeycomb', 'Gel Holder', 'Barn Doors'],
    createdAt: '2024-01-04',
  },
  {
    id: '5',
    name: 'Sennheiser MKE 600',
    brand: 'Sennheiser',
    model: 'MKE 600',
    category: 'audio' as const,
    subcategory: 'Shotgun Microphone',
    description: 'Professional shotgun microphone for video production',
    dailyRate: 80,
    weeklyRate: 450,
    availability: 'maintenance' as const,
    images: [],
    specifications: { 
      type: 'Shotgun Condenser', 
      pattern: 'Super-cardioid', 
      frequency: '40-20,000 Hz',
      power: 'Phantom/Battery' 
    },
    condition: 'good' as const,
    yearPurchased: '2022',
    serialNumber: 'MKE600001',
    accessories: ['Windscreen', 'Shock Mount', 'XLR Cable'],
    createdAt: '2024-01-05',
  },
  {
    id: '6',
    name: 'DJI Ronin RS 3 Pro',
    brand: 'DJI',
    model: 'Ronin RS 3 Pro',
    category: 'stabilization' as const,
    subcategory: 'Gimbal',
    description: '3-axis handheld gimbal stabilizer for professional cameras',
    dailyRate: 200,
    weeklyRate: 1200,
    availability: 'available' as const,
    images: [],
    specifications: { 
      payload: '4.5kg', 
      battery: '12 hours', 
      tilt: '±95°',
      control: 'Bluetooth, WiFi' 
    },
    condition: 'excellent' as const,
    yearPurchased: '2023',
    serialNumber: 'RS3P001234',
    accessories: ['Focus Motor', 'Phone Holder', 'Carrying Case'],
    createdAt: '2024-01-06',
  },
];

const videoCategories = [
  'All Categories', 
  'Cameras', 
  'Lenses', 
  'Lighting', 
  'Audio', 
  'Stabilization', 
  'Accessories'
];

export const InventoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchTerm, categoryFilter } = useSelector((state: RootState) => state.inventory);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  
  // More Filters state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [conditionFilters, setConditionFilters] = useState<string[]>([]);
  const [availabilityFilters, setAvailabilityFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case 'rented':
        return <Badge className="bg-warning text-warning-foreground">On Rental</Badge>;
      case 'maintenance':
        return <Badge className="bg-destructive text-destructive-foreground">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

  const handleView = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setViewDialogOpen(true);
  };

  const handleEdit = (equipment: Equipment) => {
    navigate(`/inventory/edit/${equipment.id}`);
  };

  const handleDeleteClick = (equipmentId: string) => {
    setEquipmentToDelete(equipmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (equipmentToDelete) {
      dispatch(deleteEquipment(equipmentToDelete));
      toast.success('Equipment removed from inventory');
      setEquipmentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const toggleConditionFilter = (condition: string) => {
    setConditionFilters(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleAvailabilityFilter = (availability: string) => {
    setAvailabilityFilters(prev => 
      prev.includes(availability) 
        ? prev.filter(a => a !== availability)
        : [...prev, availability]
    );
  };

  const clearAllFilters = () => {
    setConditionFilters([]);
    setAvailabilityFilters([]);
    setPriceRange([0, 5000]);
    dispatch(setCategoryFilter('all'));
    dispatch(setSearchTerm(''));
  };

  const activeFilterCount = conditionFilters.length + availabilityFilters.length + 
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  const filteredEquipment = mockEquipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || categoryFilter === 'All Categories' || 
                           item.category === categoryFilter.toLowerCase();
    const matchesCondition = conditionFilters.length === 0 || conditionFilters.includes(item.condition);
    const matchesAvailability = availabilityFilters.length === 0 || availabilityFilters.includes(item.availability);
    const matchesPrice = item.dailyRate >= priceRange[0] && item.dailyRate <= priceRange[1];
    return matchesSearch && matchesCategory && matchesCondition && matchesAvailability && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Production Equipment</h1>
          <p className="text-muted-foreground">
            Manage your filmmaking gear inventory and availability
          </p>
        </div>
        <Link to="/inventory/add">
          <Button variant="gradient" className="shadow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Film Equipment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gear</p>
                <p className="text-2xl font-bold text-foreground">127</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Camera className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground">98</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Rental</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft bg-gradient-card border-0">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cameras, lenses, lighting..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => dispatch(setCategoryFilter(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {videoCategories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filters</h4>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Condition Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Condition</Label>
                    <div className="space-y-2">
                      {['excellent', 'good', 'fair'].map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={`condition-${condition}`}
                            checked={conditionFilters.includes(condition)}
                            onCheckedChange={() => toggleConditionFilter(condition)}
                          />
                          <Label htmlFor={`condition-${condition}`} className="capitalize text-sm">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Availability</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'available', label: 'Available' },
                        { value: 'rented', label: 'On Rental' },
                        { value: 'maintenance', label: 'Maintenance' }
                      ].map((item) => (
                        <div key={item.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`availability-${item.value}`}
                            checked={availabilityFilters.includes(item.value)}
                            onCheckedChange={() => toggleAvailabilityFilter(item.value)}
                          />
                          <Label htmlFor={`availability-${item.value}`} className="text-sm">
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Daily Rate Range</Label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        max={5000}
                        min={0}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={() => setFiltersOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="shadow-soft bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Film Equipment Catalog</CardTitle>
          <CardDescription>
            Complete inventory of your video production gear with real-time availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Weekly Rate</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{equipment.name}</p>
                      <p className="text-sm text-muted-foreground">{equipment.description}</p>
                      <p className="text-xs text-muted-foreground">S/N: {equipment.serialNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{equipment.brand}</p>
                      <p className="text-sm text-muted-foreground">{equipment.model}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {equipment.subcategory}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">₹{equipment.dailyRate.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">₹{equipment.weeklyRate.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/week</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        equipment.condition === 'excellent' ? 'text-success border-success' :
                        equipment.condition === 'good' ? 'text-warning border-warning' :
                        'text-muted-foreground'
                      }`}
                    >
                      {equipment.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getAvailabilityBadge(equipment.availability)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(equipment)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(equipment)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(equipment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Equipment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEquipment?.name}</DialogTitle>
            <DialogDescription>{selectedEquipment?.description}</DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Brand:</dt>
                      <dd className="font-medium">{selectedEquipment.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Model:</dt>
                      <dd className="font-medium">{selectedEquipment.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category:</dt>
                      <dd className="font-medium capitalize">{selectedEquipment.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Condition:</dt>
                      <dd className="font-medium capitalize">{selectedEquipment.condition}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Serial Number:</dt>
                      <dd className="font-medium">{selectedEquipment.serialNumber}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pricing</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Daily Rate:</dt>
                      <dd className="font-medium">₹{selectedEquipment.dailyRate.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Weekly Rate:</dt>
                      <dd className="font-medium">₹{selectedEquipment.weeklyRate.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Year Purchased:</dt>
                      <dd className="font-medium">{selectedEquipment.yearPurchased}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              {Object.keys(selectedEquipment.specifications).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Specifications</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-muted-foreground capitalize">{key}:</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {selectedEquipment.accessories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Included Accessories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipment.accessories.map((accessory, index) => (
                      <Badge key={index} variant="secondary">{accessory}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this equipment from your inventory? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEquipmentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};