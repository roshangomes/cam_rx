import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { UserPlus, Upload, X, Save, Send, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { addPersonnel, ServicePersonnel } from '@/store/slices/servicePersonnelSlice';

interface AddPersonnelFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roles = [
  'Chief Technician',
  'Lightman',
  'Camera Assistant',
  'Grip',
  'Sound Engineer',
  'DIT (Digital Imaging Technician)',
  'Gaffer',
  'Focus Puller',
  'Drone Operator',
  'Steadicam Operator',
];

const idProofTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'passport', label: 'Passport' },
];

export const AddPersonnelForm: React.FC<AddPersonnelFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    idProofType: '' as ServicePersonnel['idProofType'] | '',
    idProofNumber: '',
    dailyRate: '',
    hourlyRate: '',
    experience: '',
    specializations: [] as string[],
  });
  const [idProofDocument, setIdProofDocument] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [inviteViaEmail, setInviteViaEmail] = useState(true);
  const [inviteViaSms, setInviteViaSms] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'idProof' | 'profile') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'idProof') {
        setIdProofDocument(dataUrl);
      } else {
        setProfilePhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const addSpecialization = () => {
    if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization],
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec),
    }));
  };

  const sendInvite = async (name: string, email: string, phone: string) => {
    setIsSending(true);
    // Simulate sending invite
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const channels: string[] = [];
    if (inviteViaEmail && email) channels.push(`email (${email})`);
    if (inviteViaSms && phone) channels.push(`SMS (${phone})`);
    
    setIsSending(false);
    setInviteSent(true);
    
    if (channels.length > 0) {
      toast({
        title: 'Invite sent! 📩',
        description: `App invite sent to ${name} via ${channels.join(' and ')}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.idProofType || !formData.idProofNumber) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if ((inviteViaEmail && !formData.email) || (inviteViaSms && !formData.phone)) {
      toast({
        title: 'Contact info required',
        description: 'Please provide email/phone for the selected invite method',
        variant: 'destructive',
      });
      return;
    }

    const personnel: ServicePersonnel = {
      id: `sp-${Date.now()}`,
      vendorId: 'vendor-1',
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      idProofType: formData.idProofType as ServicePersonnel['idProofType'],
      idProofNumber: formData.idProofNumber,
      idProofDocument: idProofDocument || undefined,
      profilePhoto: profilePhoto || undefined,
      dailyRate: parseFloat(formData.dailyRate) || 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      specializations: formData.specializations,
      experience: formData.experience,
      availability: 'available',
      rating: 0,
      totalJobs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addPersonnel(personnel));
    
    toast({
      title: 'Personnel added',
      description: `${formData.name} has been added to your service team`,
    });

    // Send invite
    if (inviteViaEmail || inviteViaSms) {
      await sendInvite(formData.name, formData.email, formData.phone);
    }

    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Add Service Personnel
        </CardTitle>
        <CardDescription>
          Add a new service team member with their details and ID proof
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <UserPlus className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="profilePhoto" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </span>
                </Button>
              </Label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'profile')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            {/* ID Proof Type */}
            <div className="space-y-2">
              <Label htmlFor="idProofType">ID Proof Type *</Label>
              <Select 
                value={formData.idProofType} 
                onValueChange={(value) => handleInputChange('idProofType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID proof" />
                </SelectTrigger>
                <SelectContent>
                  {idProofTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ID Proof Number */}
            <div className="space-y-2">
              <Label htmlFor="idProofNumber">ID Proof Number *</Label>
              <Input
                id="idProofNumber"
                value={formData.idProofNumber}
                onChange={(e) => handleInputChange('idProofNumber', e.target.value)}
                placeholder="Enter ID number"
                required
              />
            </div>

            {/* Daily Rate */}
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
              <Input
                id="dailyRate"
                type="number"
                value={formData.dailyRate}
                onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                placeholder="2500"
              />
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                placeholder="350"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 5 years"
              />
            </div>
          </div>

          {/* ID Proof Document Upload */}
          <div className="space-y-2">
            <Label>ID Proof Document</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {idProofDocument ? (
                <div className="relative inline-block">
                  <img src={idProofDocument} alt="ID Proof" className="max-h-32 rounded" />
                  <button
                    type="button"
                    onClick={() => setIdProofDocument(null)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload ID proof document</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'idProof')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add specialization"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" variant="outline" onClick={addSpecialization}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specializations.map(spec => (
                <Badge key={spec} variant="secondary" className="gap-1">
                  {spec}
                  <button type="button" onClick={() => removeSpecialization(spec)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Invite Options */}
          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Send className="h-4 w-4 text-primary" />
              Send App Invite
            </div>
            <p className="text-xs text-muted-foreground">
              An invite link will be sent so they can download and join the app.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={inviteViaEmail}
                  onCheckedChange={(checked) => setInviteViaEmail(!!checked)}
                />
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={inviteViaSms}
                  onCheckedChange={(checked) => setInviteViaSms(!!checked)}
                />
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">SMS / WhatsApp</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSending}>
              {isSending ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
