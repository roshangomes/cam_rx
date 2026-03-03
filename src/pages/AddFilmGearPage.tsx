import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addEquipment, Equipment } from '@/store/slices/inventorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

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
  yearPurchased: z.string().regex(/^\d{4}$/, 'Year must be a valid 4-digit year'),
  serialNumber: z.string().min(1, 'Serial number is required').max(50, 'Serial number must be less than 50 characters'),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const AddFilmGearPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageFiles, setImageFiles] = useState<string[]>([]);

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
      yearPurchased: new Date().getFullYear().toString(),
      serialNumber: '',
    },
  });

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
    const newEquipment: Equipment = {
      id: `equip-${Date.now()}`,
      name: data.name,
      brand: data.brand,
      model: data.model,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      dailyRate: data.dailyRate,
      weeklyRate: data.weeklyRate,
      availability: 'available',
      images: imageFiles,
      specifications: {},
      condition: data.condition,
      yearPurchased: data.yearPurchased,
      serialNumber: data.serialNumber,
      accessories: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(addEquipment(newEquipment));
    toast.success('Equipment added successfully!');
    navigate('/inventory');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Film Gear</h1>
          <p className="text-muted-foreground">Add new equipment to your inventory</p>
        </div>
      </div>

      <Card className="shadow-medium bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>Fill in the information about your film equipment</CardDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  Add Equipment
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};