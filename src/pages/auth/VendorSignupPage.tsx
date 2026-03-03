import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Phone } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { loginSuccess } from '@/store/slices/authSlice';
import { AadhaarKycFlow, KycData } from '@/components/kyc/AadhaarKycFlow';

type SignupMethod = 'email' | 'phone';

export const VendorSignupPage: React.FC = () => {
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  const [step, setStep] = useState<'details' | 'otp' | 'kyc'>('details');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [kycData, setKycData] = useState<KycData | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Setup reCAPTCHA verifier
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate fields
    if (!name || !businessName) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (signupMethod === 'email' && !email) {
      toast.error('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (signupMethod === 'phone' && !phone) {
      toast.error('Please enter your phone number');
      setIsLoading(false);
      return;
    }

    try {
      if (signupMethod === 'phone') {
        // Firebase Phone OTP
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
        setConfirmationResult(confirmation);
        toast.success('OTP sent to your phone number');
        setStep('otp');
      } else {
        // Email OTP - Firebase doesn't support email OTP natively
        toast.info('Email OTP requires custom backend implementation');
        toast.success('Demo OTP sent to your email (use any 6-digit code)');
        setStep('otp');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    try {
      if (signupMethod === 'phone' && confirmationResult) {
        // Verify Firebase phone OTP
        await confirmationResult.confirm(otp);
        toast.success('Phone verified! Now complete KYC verification.');
        setStep('kyc');
      } else {
        // Email - mock verification
        toast.success('Email verified! Now complete KYC verification.');
        setStep('kyc');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycComplete = (data: KycData) => {
    setKycData(data);
    
    // Complete vendor registration with KYC data
    dispatch(loginSuccess({
      id: confirmationResult ? '1' : '1',
      email: email || phone,
      name: name, // Use the name entered during signup
      role: 'vendor',
      kycStatus: data.verificationStatus,
    }));
    
    toast.success('Vendor account created successfully with KYC verification!');
    navigate('/dashboard');
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      if (signupMethod === 'phone') {
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
        setConfirmationResult(confirmation);
        toast.success('OTP resent to your phone number');
      } else {
        toast.success('OTP resent to your email');
      }
    } catch (error: any) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-6">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">FilmGear Pro</span>
          </div>
        </div>

        <Card className="shadow-strong bg-gradient-card border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Vendor Registration</CardTitle>
            <CardDescription className="text-center">
              {step === 'details' 
                ? 'Create your vendor account to start listing equipment'
                : step === 'otp'
                ? 'Enter the OTP sent to verify your account'
                : 'Complete mandatory KYC verification for vendor registration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'details' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Tabs value={signupMethod} onValueChange={(v) => setSignupMethod(v as SignupMethod)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="space-y-2 mt-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </TabsContent>
                  <TabsContent value="phone" className="space-y-2 mt-4">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-12"
                    />
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full h-12"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : step === 'otp' ? (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <Label>Enter 6-Digit OTP</Label>
                    <p className="text-sm text-muted-foreground">
                      Sent to {signupMethod === 'email' ? email : phone}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  variant="gradient"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Resend OTP
                  </Button>
                  <div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setStep('details');
                        setOtp('');
                      }}
                      className="text-sm"
                    >
                      Change {signupMethod === 'email' ? 'email' : 'phone number'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : step === 'kyc' ? (
              <div className="space-y-4">
                <AadhaarKycFlow 
                  onKycComplete={handleKycComplete}
                  userType="vendor"
                />
              </div>
            ) : null}

            <div className="mt-6 text-center space-y-2">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/vendor/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </span>
              <div className="text-sm text-muted-foreground">
                Are you a customer?{' '}
                <Link to="/customer/signup" className="text-primary hover:underline font-medium">
                  Customer Registration
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
