
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, getDocs, doc, deleteDoc, updateDoc, arrayUnion, type DocumentData, type QuerySnapshot } from 'firebase/firestore';
import { ShopHeader } from '@/components/shop/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Users, User, Trash2, Send, Mail, Check, X, Clock, Info, UserX } from 'lucide-react';
import { formatIndianCurrency, getUsersByIds } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import { type Budget, type Invitation, type UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const emailListSchema = z.string().optional().refine(
    (value) => {
        if (!value || value.trim() === '') return true; // Optional, so empty is fine
        const emails = value.split(',').map(e => e.trim());
        return emails.every(e => z.string().email().safeParse(e).success);
    },
    { message: 'Please provide a valid, comma-separated list of emails.' }
);

const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required.'),
  amount: z.coerce.number().min(1, 'Budget amount must be greater than 0.'),
  shareWith: emailListSchema,
});

type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;

function CreateBudgetForm({ existingBudgets }: { existingBudgets: Budget[] | null }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: '',
      amount: 0,
      shareWith: '',
    },
  });
  
  const shareWithValue = useWatch({
    control: form.control,
    name: 'shareWith',
  });
  
  const hasEmailsToInvite = shareWithValue && shareWithValue.trim().length > 0 && form.formState.errors.shareWith === undefined;

  const onSubmit = async (data: CreateBudgetFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    
    setIsSubmitting(true);

    // Check for duplicate budget name (case-insensitive)
    const newBudgetNameLower = data.name.toLowerCase();
    if (existingBudgets?.some(budget => budget.name.toLowerCase() === newBudgetNameLower)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Budget Name',
        description: 'A budget with this name already exists. Please choose a different name.',
      });
      setIsSubmitting(false);
      return;
    }

    if (hasEmailsToInvite && data.shareWith) {
      const emailsToInvite = data.shareWith.split(',').map((e) => e.trim()).filter(Boolean);
      
      // Firestore 'in' query is limited to 30 elements. Chunking for larger lists.
      const chunks: string[][] = [];
      for (let i = 0; i < emailsToInvite.length; i += 30) {
        chunks.push(emailsToInvite.slice(i, i + 30));
      }
      
      const foundEmails = new Set<string>();
      
      try {
        const usersRef = collection(firestore, 'users');
        for (const chunk of chunks) {
            const usersQuery = query(usersRef, where('email', 'in', chunk));
            const querySnapshot = await getDocs(usersQuery);
            querySnapshot.forEach(doc => foundEmails.add(doc.data().email));
        }

        const notFoundEmails = emailsToInvite.filter(email => !foundEmails.has(email));

        if (notFoundEmails.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid Users',
            description: `The following users are not registered: ${notFoundEmails.join(', ')}`,
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error("Error verifying users:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not verify users. Please try again.' });
        setIsSubmitting(false);
        return;
      }
    }
    
    const budgetDocRef = await addDoc(collection(firestore, 'budgets'), {
      name: data.name,
      amount: data.amount,
      userId: user.uid,
      sharedUsers: [user.uid],
      createdAt: serverTimestamp(),
    }).catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: collection(firestore, 'budgets').path,
            operation: 'create',
            requestResourceData: { name: data.name, amount: data.amount, userId: user.uid },
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
    });

    if (!budgetDocRef) {
        setIsSubmitting(false);
        return;
    }

    if (hasEmailsToInvite && data.shareWith) {
      const emails = data.shareWith.split(',').map((e) => e.trim()).filter(Boolean);
      const invitationsCollection = collection(firestore, 'invitations');
      
      for (const email of emails) {
        const newInvitation = {
            fromUserId: user.uid,
            fromUserName: user.displayName || user.email,
            toUserEmail: email,
            budgetId: budgetDocRef.id,
            budgetName: data.name,
            status: 'pending',
            createdAt: serverTimestamp(),
        };
        addDoc(invitationsCollection, newInvitation).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: invitationsCollection.path,
                operation: 'create',
                requestResourceData: newInvitation,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      }
      toast({ title: 'Budget created!', description: 'Your new budget has been created and invitations have been sent.' });
    } else {
        toast({ title: 'Budget created!', description: 'Your new budget is ready.' });
    }

    form.reset();
    setIsSubmitting(false);
  };
  
  return (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Create & Share Budget
            </CardTitle>
            <CardDescription>
            Create a budget and send invitations to collaborate by entering user emails.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Monthly Groceries" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 25000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="shareWith"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Invite Users (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter valid emails, comma-separated" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isSubmitting || (shareWithValue ? form.formState.errors.shareWith !== undefined : false)} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hasEmailsToInvite ? 'Create & Invite' : 'Create Budget'}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
}

function CollaboratorsDialog({ budget }: { budget: Budget }) {
    const firestore = useFirestore();
    const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCollaborators = async () => {
        if (!firestore || !budget.sharedUsers) return;
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
                 <Button variant="link" className="p-0 h-auto text-xs">View Collaborators</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collaborators for &quot;{budget.name}&quot;</DialogTitle>
                    <DialogDescription>
                        These users have access to this budget and its cart.
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
                                <User className="h-4 w-4 text-muted-foreground" />
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

function InvitationsDialog({ budget, onCancelInvitation }: { budget: Budget, onCancelInvitation: (invitationId: string) => void }) {
    const firestore = useFirestore();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInvitations = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const q = query(
                collection(firestore, "invitations"),
                where("budgetId", "==", budget.id),
                where("status", "==", "pending")
            );
            const querySnapshot = await getDocs(q);
            const invs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invitation));
            setInvitations(invs);
        } catch (error) {
            console.error("Error fetching invitations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => open && fetchInvitations()}>
            <DialogTrigger asChild>
                 <Button variant="link" className="p-0 h-auto text-xs text-yellow-600">View Invitations</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pending Invitations for &quot;{budget.name}&quot;</DialogTitle>
                    <DialogDescription>
                       These users have been invited but have not yet responded.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : invitations.length > 0 ? (
                    <ul className="space-y-3">
                        {invitations.map(inv => (
                            <li key={inv.id} className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex flex-col">
                                    <span className="font-medium">{inv.toUserEmail}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Sent {formatDistanceToNow(inv.createdAt?.toDate(), { addSuffix: true })}
                                    </span>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                            <UserX className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will revoke the invitation for {inv.toUserEmail}. They will not be able to join this budget unless you invite them again.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onCancelInvitation(inv.id)} className="bg-destructive hover:bg-destructive/90">
                                                Cancel Invitation
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-muted-foreground text-center py-4">No pending invitations.</p>
            }
            </DialogContent>
        </Dialog>
    );
}

function BudgetCard({ budget, user, hasPendingInvite, handleDeleteBudget, handleCancelInvitation }: { budget: Budget, user: any, hasPendingInvite: boolean, handleDeleteBudget: (id: string) => void, handleCancelInvitation: (id: string) => void }) {
    const isOwner = budget.userId === user?.uid;
    const isShared = budget.sharedUsers.length > 1;

    return (
        <li className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg">{budget.name}</p>
                    <p className="font-semibold text-primary text-lg">{formatIndianCurrency(budget.amount)}</p>
                </div>
                {isOwner && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                budget and remove it from shared users.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-sm">
                <Badge variant="outline" className="flex items-center gap-1.5">
                    {isOwner ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                    {isOwner ? "Owner" : "Member"}
                </Badge>
                
                {isShared && (
                    <>
                        <Badge variant="secondary">Collaborated</Badge>
                        <CollaboratorsDialog budget={budget} />
                    </>
                )}
                {!isShared && !hasPendingInvite && <Badge variant="secondary">Personal</Badge>}

                {hasPendingInvite && (
                    <div className="flex items-center gap-1.5">
                         <Badge variant="outline" className="flex items-center gap-1.5 text-yellow-600 border-yellow-500">
                            <Clock className="h-3 w-3" />
                            Invitation Pending
                        </Badge>
                        {isOwner && <InvitationsDialog budget={budget} onCancelInvitation={handleCancelInvitation} />}
                    </div>
                )}
            </div>
        </li>
    )
}

export default function BudgetPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query for budgets user owns or is a member of
  const budgetsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'budgets'),
      where('sharedUsers', 'array-contains', user.uid)
    );
  }, [user, firestore]);

  // Query for invitations sent TO the current user
  const incomingInvitationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'invitations'),
        where('toUserEmail', '==', user.email),
        where('status', '==', 'pending')
    );
  }, [user, firestore]);

  // Query for invitations sent FROM the current user for budgets they own
  const outgoingInvitationsQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(
          collection(firestore, 'invitations'),
          where('fromUserId', '==', user.uid),
          where('status', '==', 'pending')
      );
  }, [user, firestore]);


  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<Budget>(budgetsQuery);
  const { data: incomingInvitations, isLoading: isLoadingIncoming } = useCollection<Invitation>(incomingInvitationsQuery);
  const { data: outgoingInvitations, isLoading: isLoadingOutgoing } = useCollection<Invitation>(outgoingInvitationsQuery);

  const handleDeleteBudget = async (budgetId: string) => {
    if (!firestore) return;
    const budgetRef = doc(firestore, 'budgets', budgetId);
    deleteDoc(budgetRef)
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: budgetRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
   const handleCancelInvitation = async (invitationId: string) => {
      if (!firestore) return;
      const invitationRef = doc(firestore, 'invitations', invitationId);
      await deleteDoc(invitationRef).catch(e => {
        const permissionError = new FirestorePermissionError({ path: invitationRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
      });
      toast({ title: "Invitation Cancelled", description: "The invitation has been successfully revoked." });
  }

  const handleInvitation = async (invitation: Invitation, action: 'accept' | 'decline') => {
    if (!firestore || !user) return;
    
    const invitationRef = doc(firestore, 'invitations', invitation.id);

    if (action === 'accept') {
        const budgetRef = doc(firestore, 'budgets', invitation.budgetId);
        // Data to send for the budget update
        const budgetUpdateData = {
            sharedUsers: arrayUnion(user.uid),
            invitationId: invitation.id // Pass invitationId for security rule validation
        };

        // Add user to the budget's sharedUsers array
        await updateDoc(budgetRef, budgetUpdateData).catch(e => {
            // The permission error emitter will now get the full context including the invitationId
            const permissionError = new FirestorePermissionError({
                 path: budgetRef.path, 
                 operation: 'update', 
                 requestResourceData: { sharedUsers: [user.uid], invitationId: invitation.id } // Send plain array for rules
            });
            errorEmitter.emit('permission-error', permissionError);
            throw e; // re-throw to stop execution
        });
    }

    // Update the invitation status
    await updateDoc(invitationRef, { status: action }).catch(e => {
        const permissionError = new FirestorePermissionError({ path: invitationRef.path, operation: 'update', requestResourceData: { status: action } });
        errorEmitter.emit('permission-error', permissionError);
    });
    
    toast({ title: `Invitation ${action === 'accept' ? 'Accepted' : 'Declined'}`, description: `You have ${action}ed the invitation to the budget "${invitation.budgetName}".` });
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ShopHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Budgets</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-8">
                {isClient && <CreateBudgetForm existingBudgets={budgets} />}
            </div>
            
            <div className="lg:col-span-2 space-y-8">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Your Budgets
                    </CardTitle>
                    <CardDescription>
                    Budgets you own or are a collaborator on.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(isUserLoading || isLoadingBudgets || isLoadingOutgoing) ? (
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    ) : budgets && budgets.length > 0 ? (
                    <ul className="space-y-4">
                        {budgets.map((budget) => {
                            const hasPending = !!outgoingInvitations?.some(inv => inv.budgetId === budget.id);
                            return (
                                <BudgetCard 
                                    key={budget.id}
                                    budget={budget}
                                    user={user}
                                    hasPendingInvite={hasPending}
                                    handleDeleteBudget={handleDeleteBudget}
                                    handleCancelInvitation={handleCancelInvitation}
                                />
                            )
                        })}
                    </ul>
                    ) : (
                    <p className="text-center text-muted-foreground">
                        You don&apos;t have any budgets yet. Create one to get started!
                    </p>
                    )}
                </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Pending Invitations
                        </CardTitle>
                        <CardDescription>
                        Invitations to join other users' budgets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingIncoming ? (
                             <div className="flex justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : incomingInvitations && incomingInvitations.length > 0 ? (
                            <ul className="space-y-4">
                                {incomingInvitations.map(invitation => (
                                    <li key={invitation.id} className="rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p><span className="font-semibold">{invitation.fromUserName}</span> has invited you to join:</p>
                                            <p className="font-bold text-primary text-lg">{invitation.budgetName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Received {invitation.createdAt ? formatDistanceToNow(invitation.createdAt.toDate(), { addSuffix: true }) : ''}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-center">
                                            <Button size="sm" variant="outline" onClick={() => handleInvitation(invitation, 'decline')}>
                                                <X className="mr-1 h-4 w-4" /> Decline
                                            </Button>
                                            <Button size="sm" onClick={() => handleInvitation(invitation, 'accept')}>
                                                <Check className="mr-1 h-4 w-4" /> Accept
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground">
                                You have no pending invitations.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
