import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Mail, Phone, MapPin, Calendar, Shield, Star, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KycBadge } from '@/components/kyc/KycBadge';
import { TrustScoreDisplay } from '@/components/kyc/TrustScoreDisplay';
import { AadhaarKycFlow } from '@/components/kyc/AadhaarKycFlow';
import { RootState } from '@/store/store';

export const CustomerProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showKycFlow, setShowKycFlow] = useState(false);

  // Mock profile data - would come from backend
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    bio: 'Filmmaker and content creator specializing in documentaries.',
    joinedDate: '2024-01-15',
    kycStatus: 'not_verified' as 'not_verified' | 'pending' | 'verified',
    trustScore: 0,
  });

  const stats = [
    { label: 'Total Bookings', value: '12', icon: Camera },
    { label: 'Active Rentals', value: '2', icon: Calendar },
    { label: 'Reviews Given', value: '8', icon: Star },
    { label: 'Favorites', value: '15', icon: Star },
  ];

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
  };

  const handleKycComplete = (success: boolean) => {
    if (success) {
      setProfileData({ ...profileData, kycStatus: 'verified', trustScore: 85 });
    }
    setShowKycFlow(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profileData.name}</CardTitle>
              <CardDescription>{profileData.email}</CardDescription>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <KycBadge isVerified={profileData.kycStatus === 'verified'} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {profileData.kycStatus === 'verified' && (
                <TrustScoreDisplay 
                  score={profileData.trustScore} 
                  isKycVerified={true}
                  totalBookings={12}
                  averageRating={4.5}
                />
              )}

              {profileData.kycStatus === 'not_verified' && (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => setShowKycFlow(true)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Identity
                </Button>
              )}

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profileData.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and bio
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button variant="gradient">Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Preference settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* KYC Flow Modal */}
      {showKycFlow && (
        <AadhaarKycFlow 
          onKycComplete={(kycData) => {
            setProfileData({ ...profileData, kycStatus: 'verified', trustScore: 85 });
            setShowKycFlow(false);
          }}
          userType="customer"
        />
      )}
    </div>
  );
};
