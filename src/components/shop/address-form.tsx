
'use client';

import { useState } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { type DeliveryAddress } from '@/lib/types';


const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  addressLine1: z.string().min(1, "Address line 1 is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  country: z.string().min(1, "Country is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
});

type AddressFormValues = z.infer<typeof addressSchema>;


export function AddressForm({ onSave, onCancel }: { onSave: (address: DeliveryAddress) => void, onCancel: () => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: { 
            fullName: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            phoneNumber: "",
        }
    });

    const onSubmit = async (data: AddressFormValues) => {
        if (!user || !firestore) return;
        setIsSubmitting(true);
        try {
            const addressesRef = collection(firestore, 'users', user.uid, 'addresses');
            const newAddressRef = await addDoc(addressesRef, {
                ...data,
                userId: user.uid,
            });
            const newAddress: DeliveryAddress = { ...data, id: newAddressRef.id, userId: user.uid };
            toast({ title: "Address Saved", description: "Your new address has been saved." });
            onSave(newAddress);
        } catch (error) {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: collection(firestore, 'users', user.uid, 'addresses').path,
                operation: 'create',
                requestResourceData: { ...data, userId: user.uid }
            }));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="addressLine1" render={({ field }) => (
                    <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="addressLine2" render={({ field }) => (
                    <FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Address"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
