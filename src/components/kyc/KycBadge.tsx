import React from 'react';
import { ShieldCheck, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KycBadgeProps {
  isVerified: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const KycBadge: React.FC<KycBadgeProps> = ({ 
  isVerified, 
  variant = 'default',
  className = '' 
}) => {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex ${className}`}>
              {isVerified ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVerified ? 'Aadhaar KYC Verified' : 'KYC Not Verified'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge 
      variant={isVerified ? 'default' : 'outline'}
      className={`gap-1.5 ${isVerified ? 'bg-success text-success-foreground' : 'border-muted-foreground/30'} ${className}`}
    >
      {isVerified ? (
        <>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>KYC Verified</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Not Verified</span>
        </>
      )}
    </Badge>
  );
};
