import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, CreditCard, Shield, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const VendorSettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPayments: true,
    emailReviews: true,
    pushBookings: true,
    pushPayments: false,
    pushMessages: true,
    smsBookings: false,
    smsPayments: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showRatings: true,
    showLocation: true,
    allowMessages: true,
  });

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSavePrivacy = () => {
    toast.success('Privacy settings saved');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password changed successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Choose what email notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Bookings</Label>
                  <p className="text-sm text-muted-foreground">Receive emails for new booking requests</p>
                </div>
                <Switch
                  checked={notifications.emailBookings}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailBookings: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payment status changes</p>
                </div>
                <Switch
                  checked={notifications.emailPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailPayments: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reviews & Ratings</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new reviews on your equipment</p>
                </div>
                <Switch
                  checked={notifications.emailReviews}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailReviews: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>Manage your browser push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts for new bookings</p>
                </div>
                <Switch
                  checked={notifications.pushBookings}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushBookings: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Alerts for payment transactions</p>
                </div>
                <Switch
                  checked={notifications.pushPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushPayments: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Customer Messages</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new customer messages</p>
                </div>
                <Switch
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushMessages: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>Manage SMS alerts to your phone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking SMS</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS for urgent booking updates</p>
                </div>
                <Switch
                  checked={notifications.smsBookings}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsBookings: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment SMS</Label>
                  <p className="text-sm text-muted-foreground">SMS alerts for payment confirmations</p>
                </div>
                <Switch
                  checked={notifications.smsPayments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsPayments: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication is not enabled for your account.
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information and how you appear to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Business Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your business profile visible to customers</p>
                </div>
                <Switch
                  checked={privacy.showProfile}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showProfile: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Display Ratings</Label>
                  <p className="text-sm text-muted-foreground">Show your ratings and reviews publicly</p>
                </div>
                <Switch
                  checked={privacy.showRatings}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showRatings: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Location</Label>
                  <p className="text-sm text-muted-foreground">Display your business location to customers</p>
                </div>
                <Switch
                  checked={privacy.showLocation}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showLocation: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">Let customers send you direct messages</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, allowMessages: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePrivacy}>Save Settings</Button>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Payments
              </CardTitle>
              <CardDescription>Manage your billing information and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Billing management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
