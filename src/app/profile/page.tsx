
'use client';

import { ShopHeader } from '@/components/shop/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useUserProfile, useFirestore, useAuth, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, getFirestore, writeBatch, getDoc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Package, AlertTriangle, ArrowRight, Home, Trash2, User as UserIcon, LogOut, CalendarDays, CheckCircle, AlertCircle, Users, Edit, Plus, XCircle, ShoppingCart, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { formatIndianCurrency, getUsersByIds } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { type Purchase, type PurchasedItem, type Budget, type UserProfile, type DeliveryAddress } from '@/lib/types';
import { products as allProducts } from '@/lib/mock-data';
import { signOut, sendEmailVerification, updateEmail as updateAuthEmail, FirebaseError } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ShipmentTracker } from '@/components/shop/shipment-tracker';
import { Badge } from '@/components/ui/badge';
import { useBudget } from '@/hooks/use-budget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddressForm } from '@/components/shop/address-form';
import LoginPage from '@/app/login/page';

const productMap = new Map(allProducts.map(p => [p.id, p]));

function PriceDropAlert({ originalPrice, currentPrice }: { originalPrice: number; currentPrice: number }) {
  if (currentPrice >= originalPrice) return null;
  const savings = originalPrice - currentPrice;
  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-50 p-2 text-sm text-yellow-800">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div>
        <span className="font-bold">Price Drop!</span> This item is now available for{' '}
        <span className="font-bold">{formatIndianCurrency(currentPrice)}</span>. You could save{' '}
        <span className="font-bold">{formatIndianCurrency(savings)}</span> by re-ordering.
      </div>
    </div>
  );
}

function OrderItem({ item }: { item: PurchasedItem }) {
    const currentProduct = productMap.get(item.productId);
    return (
        <div key={item.productId} className="flex items-center gap-4 py-2">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    data-ai-hint={item.imageHint}
                />
            </div>
            <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatIndianCurrency(item.priceAtPurchase)}
                </p>
                 {currentProduct && <PriceDropAlert originalPrice={item.priceAtPurchase} currentPrice={currentProduct.price} />}
            </div>
            <p className="font-medium">{formatIndianCurrency(item.priceAtPurchase * item.quantity)}</p>
        </div>
    );
}

function CollaboratorsDialog({ budget }: { budget: Budget | null }) {
    const firestore = useFirestore();
    const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCollaborators = async () => {
        if (!firestore || !budget?.sharedUsers) return;
        setIsLoading(true);
        try {
            const users = await getUsersByIds(firestore, budget.sharedUsers);
            setCollaborators(users);
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => open && fetchCollaborators()}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="h-auto p-0">View Collaborators</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collaborators for &quot;{budget?.name}&quot;</DialogTitle>
                    <DialogDescription>
                        These are the members of the budget for this order.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {collaborators.map(user => (
                            <li key={user.id} className="flex items-center gap-2 rounded-md border p-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user.name}</span>
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
}

const editProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;


function EditProfileDialog({ userProfile }: { userProfile: UserProfile }) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    values: {
      name: userProfile.name || '',
      email: userProfile.email || '',
    },
  });

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!user || !auth || !firestore) return;

    setIsSubmitting(true);
    let emailChanged = false;

    try {
      // Step 1: Update email in Firebase Auth if it has changed
      if (data.email !== user.email) {
        await updateAuthEmail(user, data.email);
        await sendEmailVerification(user); // Send verification to the new email
        emailChanged = true;
        toast({
          title: "Verification Required",
          description: "A verification link has been sent to your new email address.",
        });
      }

      // Step 2: Update user profile in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const updateData: Partial<UserProfile> = {
        name: data.name,
        email: data.email,
      };
      
      await updateDoc(userDocRef, updateData);

      toast({
        title: "Profile Updated",
        description: `Your profile has been successfully updated.${emailChanged ? ' Please verify your new email.' : ''}`
      });

      setIsOpen(false); // Close the dialog on success
    } catch (error: any) {
      if (error.code === 'firestore/permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: doc(firestore, "users", user.uid).path,
            operation: 'update',
            requestResourceData: { name: data.name, email: data.email }
          });
          errorEmitter.emit('permission-error', permissionError);
          throw permissionError;
      }
      
      let description = "Could not update your profile. Please try again.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This action requires you to have signed in recently. Please log out and log back in to change your email.";
      } else if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already in use by another account.";
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function MyOrders({ userProfile }: { userProfile: UserProfile | null }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { budgets } = useBudget();

  const ordersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'purchases'), orderBy('purchaseDate', 'desc'));
  }, [user, firestore]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Purchase>(ordersQuery);
  
  const getBudgetForOrder = useCallback((order: Purchase): Budget | null => {
      if (!order.budgetId || !budgets) return null;
      return budgets.find(b => b.id === order.budgetId) || null;
  },[budgets]);

  useEffect(() => {
    if (!orders || !user || !firestore) return;

    const now = new Date();
    const thirtySixHoursAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000);
    const eightyFourHoursAgo = new Date(now.getTime() - 84 * 60 * 60 * 1000);
    
    const batch = writeBatch(getFirestore());
    let hasUpdates = false;

    orders.forEach((order) => {
      const purchaseDate = order.purchaseDate?.toDate();
      if (!purchaseDate) return;
      const orderRef = doc(firestore, 'users', user.uid, 'purchases', order.id);

      // From Shipped to Delivered
      if (order.status === 'Shipped' && purchaseDate < eightyFourHoursAgo) {
        batch.update(orderRef, { status: 'Delivered' });
        hasUpdates = true;
      }
      // From Processing to Shipped
      else if (order.status === 'Processing' && purchaseDate < thirtySixHoursAgo) {
        batch.update(orderRef, { status: 'Shipped' });
        hasUpdates = true;
      }
    });
    
    if (hasUpdates) {
      batch.commit().catch(error => {
        console.error(`Failed to batch update order statuses:`, error);
      });
    }
  }, [orders, user, firestore]);


  const handleCancelOrder = async (orderToCancel: Purchase) => {
    if (!user || !userProfile || !firestore) return;
    
    if (orderToCancel.budgetId) {
        const budget = getBudgetForOrder(orderToCancel);
        if (!budget) {
            toast({
                variant: 'destructive',
                title: 'Cannot Cancel Order',
                description: 'This order is part of a deleted budget and cannot be modified.',
            });
            return;
        }
    }

    try {
        const db = getFirestore();
        const batch = writeBatch(db);

        const cancellationData: Partial<Purchase> = {
            status: 'Cancelled',
            cancelledByUserId: user.uid,
            cancelledByUserName: userProfile.name
        };

        if (orderToCancel.budgetId) {
            const budgetRef = doc(db, 'budgets', orderToCancel.budgetId);
            const budgetSnap = await getDoc(budgetRef);
            if (budgetSnap.exists()) {
                const budgetData = budgetSnap.data() as Budget;
                for (const memberId of budgetData.sharedUsers) {
                    const memberOrderRef = doc(db, 'users', memberId, 'purchases', orderToCancel.id);
                    batch.update(memberOrderRef, cancellationData);
                }
            }
        } else {
            const orderRef = doc(db, 'users', user.uid, 'purchases', orderToCancel.id);
            batch.update(orderRef, cancellationData);
        }
        
        await batch.commit();

        toast({ title: 'Order Cancelled', description: 'Your order has been successfully cancelled.' });

    } catch (e) {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/purchases/${orderToCancel.id}`,
            operation: 'update',
            requestResourceData: { status: 'Cancelled', budgetId: orderToCancel.budgetId }
        });
        errorEmitter.emit('permission-error', permissionError);
    }
};

const handleDeleteOrder = async (orderToDelete: Purchase) => {
    if (!user || !firestore) return;

    const db = getFirestore();
    const batch = writeBatch(db);

    try {
        if (orderToDelete.budgetId) {
            const budgetRef = doc(db, 'budgets', orderToDelete.budgetId);
            const budgetSnap = await getDoc(budgetRef);

            if (budgetSnap.exists()) {
                // Budget exists, delete for all collaborators
                const budgetData = budgetSnap.data() as Budget;
                for (const memberId of budgetData.sharedUsers) {
                    const memberOrderRef = doc(db, 'users', memberId, 'purchases', orderToDelete.id);
                    batch.delete(memberOrderRef);
                }
            } else {
                // Budget was deleted, just delete for the current user
                const orderRef = doc(db, 'users', user.uid, 'purchases', orderToDelete.id);
                batch.delete(orderRef);
            }
        } else {
            // Not a budget order, just delete for the current user
            const orderRef = doc(db, 'users', user.uid, 'purchases', orderToDelete.id);
            batch.delete(orderRef);
        }

        await batch.commit();
        toast({ title: 'Order Deleted', description: 'Your order has been removed from your history.' });
    } catch (e) {
        // Create a generic permission error as the path might be different for batch writes
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/purchases/${orderToDelete.id}`, // Path is for context, may not be exact failing path
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
};


  if (isLoadingOrders) {
    return (
      <div className="flex justify-center mt-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return orders && orders.length > 0 ? (
    <div className="space-y-6">
      {orders.map((order) => {
        const purchaseDate = order.purchaseDate?.toDate();
        const shippedByDate = purchaseDate ? addDays(purchaseDate, 2) : null;
        const deliveredByDate = purchaseDate ? addDays(purchaseDate, 5) : null;
        const orderBudget = getBudgetForOrder(order);
        const budgetWasDeleted = order.budgetId && !orderBudget;
        const canBeCancelled = order.status === 'Processing' && !budgetWasDeleted;
        
        return (
            <Card key={order.id} className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/50 p-4">
                <div className="flex-1 grid gap-1">
                <CardTitle className="text-lg">Order #{order.id.slice(0, 7).toUpperCase()}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {order.budgetName && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          Collaborated Order
                        </Badge>
                        <Badge variant="secondary">From: {order.budgetName}</Badge>
                      </div>
                    )}
                    {budgetWasDeleted && (
                        <Badge variant="destructive" className="gap-1">
                          <Users className="h-3 w-3" />
                          Budget Deleted
                        </Badge>
                    )}
                     {order.status === 'Cancelled' && order.cancelledByUserName && (
                        <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Cancelled by {order.cancelledByUserId === user?.uid ? 'You' : order.cancelledByUserName}
                        </Badge>
                    )}
                    {purchaseDate && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Ordered on {format(purchaseDate, 'PPP')}
                        </span>
                    )}
                    {shippedByDate && order.status === 'Processing' && (
                         <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Est. Ship: {format(shippedByDate, 'PPP')}
                        </span>
                    )}
                    {deliveredByDate && (order.status === 'Processing' || order.status === 'Shipped') && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Est. Delivery: {format(deliveredByDate, 'PPP')}
                        </span>
                    )}
                </CardDescription>
                 {orderBudget && <CollaboratorsDialog budget={orderBudget} />}
                 {order.deliveryAddress && (
                    <p className="text-sm text-muted-foreground mt-2">
                        To: <span className="font-medium text-foreground">{order.deliveryAddress.fullName}</span>, {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}
                    </p>
                 )}
                <p className="text-lg font-bold mt-1">{formatIndianCurrency(order.totalAmount)}</p>
                </div>
                <div className="flex flex-col items-stretch gap-4 w-full md:w-auto">
                    <ShipmentTracker status={order.status} />
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order)} disabled={!canBeCancelled} className="flex-1">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex-1 bg-destructive/90">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this order
                                        from your history {order.budgetId && !budgetWasDeleted ? ' and the history of all collaborators.' : '.'}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Keep</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteOrder(order)}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete Permanently
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                {order.items.map((item) => (
                <OrderItem key={item.productId} item={item} />
                ))}
            </CardContent>
            </Card>
        );
      })}
    </div>
  ) : (
    <div className="mt-16 flex flex-col items-center justify-center text-center">
      <Package className="h-24 w-24 text-muted" />
      <h2 className="mt-6 text-2xl font-semibold">No orders yet</h2>
      <p className="mt-2 text-muted-foreground">
        Looks like you haven&apos;t made any purchases.
      </p>
      <Button asChild className="mt-6">
          <Link href="/">
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
      </Button>
    </div>
  );
}

function MyAddresses() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);

    const addressesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'addresses'));
    }, [user, firestore]);

    const { data: addresses, isLoading } = useCollection<DeliveryAddress>(addressesQuery);

    const handleDelete = async (addressId: string) => {
        if (!user || !firestore) return;
        const addressRef = doc(firestore, 'users', user.uid, 'addresses', addressId);
        try {
            await deleteDoc(addressRef);
            toast({ title: "Address Deleted" });
        } catch (error) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({ path: addressRef.path, operation: 'delete' }));
        }
    };
    
    if (isLoading) {
        return (
          <div className="flex justify-center mt-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Delivery Addresses</CardTitle>
                    <CardDescription>Manage your saved delivery addresses.</CardDescription>
                </div>
                {!isAdding && (
                     <Button onClick={() => setIsAdding(true)}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                )}
            </CardHeader>
            <CardContent>
                {isAdding ? (
                    <AddressForm onSave={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
                ) : addresses && addresses.length > 0 ? (
                    <div className="space-y-4">
                        {addresses.map(address => (
                            <div key={address.id} className="border rounded-lg p-4 flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{address.fullName}</p>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.city}, {address.state} {address.postalCode}</p>
                                    <p>{address.country}</p>
                                    <p>Phone: {address.phoneNumber}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You have no saved addresses.</p>
                        <p>Click "Add New" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
  const auth = useAuth();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { userProfile, isUserProfileLoading } = useUserProfile();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("orders");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleLogout = () => {
    if(auth) {
      signOut(auth);
    }
    router.push('/login');
  }

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
        // Use localStorage to implement a robust cooldown
        const lastSent = localStorage.getItem('lastVerificationSent');
        const now = new Date().getTime();
        const sixtySeconds = 60 * 1000;

        if (lastSent && (now - parseInt(lastSent, 10)) < sixtySeconds) {
            toast({
                variant: 'destructive',
                title: 'Please wait',
                description: `You can send another verification email in ${Math.ceil((sixtySeconds - (now - parseInt(lastSent, 10))) / 1000)} seconds.`,
            });
            return;
        }

        setIsResendingVerification(true);
        try {
            await sendEmailVerification(user);
            localStorage.setItem('lastVerificationSent', now.toString());
            toast({
                title: 'Verification Email Sent',
                description: 'A new verification link has been sent to your email address.',
            });
            setVerificationSent(true);
            setTimeout(() => {
                setIsResendingVerification(false);
                setVerificationSent(false);
            }, sixtySeconds);
        } catch (error: any) {
            console.error('Error sending verification email:', error);
            let description = 'Failed to send verification email. Please try again later.';
            if (error.code === 'auth/too-many-requests') {
                description = 'You have requested this too many times. Please wait a while before trying again.';
            }
            toast({
                variant: 'destructive',
                title: 'Error',
                description: description,
            });
            setIsResendingVerification(false);
        }
    }
  };
  
  if (isAuthLoading || isUserProfileLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <ShopHeader />
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        </div>
    )
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ShopHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            {userProfile ? (
              <div className="flex items-center gap-4">
                 <UserIcon className="h-12 w-12 text-muted-foreground" />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">
                    {userProfile.name}
                    </h1>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                    <p>{user.email}</p>
                    {user.emailVerified ? (
                        <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                        </Badge>
                    ) : (
                        <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        >
                        <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-accent">
                            <AlertCircle className="h-3 w-3" />
                            {isResendingVerification ? (verificationSent ? 'Sent!' : 'Sending...') : 'Unverified'}
                        </Badge>
                        </Button>
                    )}
                    </div>
                </div>
              </div>
            ) : <div className="h-12 w-48 bg-muted rounded-md animate-pulse" />}

            {userProfile && (
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <EditProfileDialog userProfile={userProfile} />
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            )}
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">
                <Package className="mr-2 h-4 w-4" /> My Orders
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <Home className="mr-2 h-4 w-4" /> Delivery Addresses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <MyOrders userProfile={userProfile} />
            </TabsContent>
            <TabsContent value="addresses">
              <MyAddresses />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
