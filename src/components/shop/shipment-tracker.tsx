
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

type Status = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

interface ShipmentTrackerProps {
  status: Status;
}

const steps: { name: Status; icon: React.ElementType }[] = [
  { name: 'Processing', icon: Package },
  { name: 'Shipped', icon: Truck },
  { name: 'Delivered', icon: CheckCircle },
];

export function ShipmentTracker({ status }: ShipmentTrackerProps) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((step) => step.name === status);

  return (
    <div className="flex w-full items-center gap-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        return (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  'mt-1 text-xs text-center',
                  isCompleted ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 flex-1',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
