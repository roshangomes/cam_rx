import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateEquipment, Equipment } from '@/store/slices/inventorySlice';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { toast } from 'sonner';

// Mock equipment data for lookup (same as InventoryPage)
const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Canon EOS R5',
    brand: 'Canon',
    model: 'EOS R5',
    category: 'cameras',
    subcategory: 'Mirrorless Camera',
    description: 'Professional full-frame mirrorless camera with 8K video recording',
    dailyRate: 1200,
    weeklyRate: 7000,
    availability: 'available',
    images: [],
    specifications: { sensor: '45MP Full Frame', video: '8K RAW, 4K 120p', iso: '100-51200', mount: 'RF Mount' },
    condition: 'excellent',
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
    category: 'cameras',
    subcategory: 'Cinema Camera',
    description: 'Compact cinema camera with APS-C sensor',
    dailyRate: 800,
    weeklyRate: 4500,
    availability: 'rented',
    images: [],
    specifications: { sensor: 'APS-C CMOS', video: '4K 120p', iso: '100-32000', mount: 'E Mount' },
    condition: 'excellent',
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
    category: 'lenses',
    subcategory: 'Zoom Lens',
    description: 'Professional standard zoom lens with image stabilization',
    dailyRate: 300,
    weeklyRate: 1800,
    availability: 'available',
    images: [],
    specifications: { mount: 'Canon RF', aperture: 'f/2.8', stabilization: '5-stop IS', weight: '900g' },
    condition: 'excellent',
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
    category: 'lighting',
    subcategory: 'LED Panel',
    description: 'Color-tunable LED softlight with full spectrum control',
    dailyRate: 450,
    weeklyRate: 2500,
    availability: 'available',
    images: [],
    specifications: { power: '400W', color: 'Full RGB+W', beam: '115° x 55°', control: 'DMX, RDM, Ethernet' },
    condition: 'excellent',
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
    category: 'audio',
    subcategory: 'Shotgun Microphone',
    description: 'Professional shotgun microphone for video production',
    dailyRate: 80,
    weeklyRate: 450,
    availability: 'maintenance',
    images: [],
    specifications: { type: 'Shotgun Condenser', pattern: 'Super-cardioid', frequency: '40-20,000 Hz', power: 'Phantom/Battery' },
    condition: 'good',
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
    category: 'stabilization',
    subcategory: 'Gimbal',
    description: '3-axis handheld gimbal stabilizer for professional cameras',
    dailyRate: 200,
    weeklyRate: 1200,
    availability: 'available',
    images: [],
    specifications: { payload: '4.5kg', battery: '12 hours', tilt: '±95°', control: 'Bluetooth, WiFi' },
    condition: 'excellent',
    yearPurchased: '2023',
    serialNumber: 'RS3P001234',
    accessories: ['Focus Motor', 'Phone Holder', 'Carrying Case'],
    createdAt: '2024-01-06',
  },
];

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  brand: z.string().min(1, 'Brand is required').max(50, 'Brand must be less than 50 characters'),
  model: z.string().min(1, 'Model is required').max(50, 'Model must be less than 50 characters'),
  category: z.enum(['cameras', 'lenses', 'lighting', 'audio', 'stabilization', 'accessories']),
  subcategory: z.string().min(1, 'Subcategory is required').max(50, 'Subcategory must be less than 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  dailyRate: z.coerce.number().min(1, 'Daily rate must be at least ₹1').max(100000, 'Daily rate must be less than ₹100000'),
  weeklyRate: z.coerce.number().min(1, 'Weekly rate must be at least ₹1').max(500000, 'Weekly rate must be less than ₹500000'),
  condition: z.enum(['excellent', 'good', 'fair']),
  availability: z.enum(['available', 'rented', 'maintenance']),
  yearPurchased: z.string().regex(/^\d{4}$/, 'Year must be a valid 4-digit year'),
  serialNumber: z.string().min(1, 'Serial number is required').max(50, 'Serial number must be less than 50 characters'),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const EditFilmGearPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  // Check Redux store first, then fallback to mock data
  const storeEquipment = useSelector((state: RootState) => 
    state.inventory.equipment.find(e => e.id === id)
  );

  useEffect(() => {
    // Try Redux store first, then mock data
    const found = storeEquipment || mockEquipment.find(e => e.id === id);
    if (found) {
      setEquipment(found);
      setImageFiles(found.images || []);
    } else {
      toast.error('Equipment not found');
      navigate('/inventory');
    }
  }, [id, storeEquipment, navigate]);

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      category: 'cameras',
      subcategory: '',
      description: '',
      dailyRate: 0,
      weeklyRate: 0,
      condition: 'excellent',
      availability: 'available',
      yearPurchased: new Date().getFullYear().toString(),
      serialNumber: '',
    },
  });

  // Reset form when equipment loads
  useEffect(() => {
    if (equipment) {
      form.reset({
        name: equipment.name,
        brand: equipment.brand,
        model: equipment.model,
        category: equipment.category,
        subcategory: equipment.subcategory,
        description: equipment.description,
        dailyRate: equipment.dailyRate,
        weeklyRate: equipment.weeklyRate,
        condition: equipment.condition,
        availability: equipment.availability,
        yearPurchased: equipment.yearPurchased,
        serialNumber: equipment.serialNumber,
      });
    }
  }, [equipment, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageFiles((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EquipmentFormData) => {
    if (!equipment) return;

    const updatedEquipment: Equipment = {
      ...equipment,
      name: data.name,
      brand: data.brand,
      model: data.model,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      dailyRate: data.dailyRate,
      weeklyRate: data.weeklyRate,
      availability: data.availability,
      images: imageFiles,
      condition: data.condition,
      yearPurchased: data.yearPurchased,
      serialNumber: data.serialNumber,
    };

    dispatch(updateEquipment(updatedEquipment));
    toast.success('Equipment updated successfully!');
    navigate('/inventory');
  };

  if (!equipment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading equipment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Film Gear</h1>
          <p className="text-muted-foreground">Update equipment details</p>
        </div>
      </div>

      <Card className="shadow-medium bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>Modify the information about your film equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Canon EOS R5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cameras">Cameras</SelectItem>
                          <SelectItem value="lenses">Lenses</SelectItem>
                          <SelectItem value="lighting">Lighting</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="stabilization">Stabilization</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Canon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EOS R5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mirrorless Camera" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="rented">On Rental</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Rate (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeklyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Rate (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearPurchased"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Purchased *</FormLabel>
                      <FormControl>
                        <Input placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="SN123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the equipment, its features, and any included accessories..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Equipment Images</FormLabel>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload images
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageFiles.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="shadow-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
