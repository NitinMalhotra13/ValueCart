
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { type DeliveryAddress } from '@/lib/types';
import { AddressForm } from './address-form';

export function CheckoutDialog({ open, onOpenChange, onCheckout }: { open: boolean, onOpenChange: (open: boolean) => void, onCheckout: (address: DeliveryAddress) => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  const addressesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'addresses'));
  }, [user, firestore]);
  
  const { data: addresses, isLoading } = useCollection<DeliveryAddress>(addressesQuery);

  useEffect(() => {
    // This effect runs when the dialog opens or addresses data changes.
    // It decides the initial state of the dialog view.
    if (!isLoading && open) {
      if (addresses && addresses.length > 0) {
        // If addresses exist, show the selection view and default to the first address.
        setIsAddingAddress(false);
        setSelectedAddressId(addresses[0].id);
      } else {
        // If no addresses exist, immediately switch to the form to add one.
        setIsAddingAddress(true);
        setSelectedAddressId(undefined);
      }
    }
  }, [addresses, isLoading, open]);
  
  const handleAddressSaved = (newAddress: DeliveryAddress) => {
    // After a new address is saved, automatically select it.
    setSelectedAddressId(newAddress.id);
    setIsAddingAddress(false); // Switch back to selection view
  }

  const handleConfirmCheckout = () => {
    const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
    if (selectedAddress) {
      onCheckout(selectedAddress);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
          // Reset state when dialog closes
          setIsAddingAddress(false);
          setSelectedAddressId(undefined);
      }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Checkout</DialogTitle>
          <DialogDescription>Please select a saved address or add a new one to continue.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : isAddingAddress ? (
            <AddressForm onSave={handleAddressSaved} onCancel={() => setIsAddingAddress(false)} />
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                    {addresses?.map(address => (
                        <Label key={address.id} htmlFor={address.id} className="flex items-start gap-3 rounded-md border p-4 cursor-pointer hover:bg-accent has-[input:checked]:border-primary">
                            <RadioGroupItem value={address.id} id={address.id} />
                            <div>
                                <p className="font-semibold">{address.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {address.addressLine1}, {address.city}, {address.state} {address.postalCode}
                                </p>
                            </div>
                        </Label>
                    ))}
                </div>
            </RadioGroup>
            <Button variant="link" onClick={() => setIsAddingAddress(true)}>+ Add a new address</Button>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirmCheckout} disabled={!selectedAddressId || isAddingAddress}>Confirm Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
