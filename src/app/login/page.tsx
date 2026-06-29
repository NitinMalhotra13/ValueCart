
'use client';

import { ShopHeader } from '@/components/shop/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { initiateEmailSignIn, initiateEmailSignUp, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/auth';


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const signUpSchema = z.object({
    name: z.string().min(2, { message: 'Please enter your name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
});

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

function Login() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetView, setIsResetView] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const handleAuthError = (error: FirebaseError) => {
    let title = 'An error occurred';
    let description = 'Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        title = 'Invalid Credentials';
        description = 'The email or password you entered is incorrect.';
        break;
      case 'auth/email-already-in-use':
        title = 'Email Already in Use';
        description = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'The password must be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
         title = 'Invalid Email';
         description = 'The email address is not valid.';
         break;
       case 'auth/too-many-requests':
        title = 'Too Many Requests';
        description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
        break;
      default:
        // Use default title and description for other errors
        break;
    }

    toast({ variant: 'destructive', title, description });
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
        await initiateEmailSignIn(auth, data.email, data.password);
        toast({ title: 'Success!', description: 'Signing you in...'});
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
        await initiateEmailSignUp(auth, data.email, data.password, data.name);
        toast({ title: 'Success!', description: 'Your account has been created! Please check your email to verify your account.'});
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onResetSubmit = async (data: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      await initiatePasswordReset(auth, data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a link to reset your password.',
      });
      setIsResetView(false);
      resetForm.reset();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        {!isResetView ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>Enter your email and password to sign in.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField control={loginForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={loginForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <Button variant="link" onClick={() => setIsResetView(true)}>Forgot Password?</Button>
                </CardFooter>
            </TabsContent>
            <TabsContent value="signup">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Enter your details to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                        <FormField control={signUpForm.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                      />
                      <FormField control={signUpForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={signUpForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </CardContent>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField control={resetForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="you@example.com" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Mail className="mr-2" />Send Reset Link
                    </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                <Button variant="link" onClick={() => setIsResetView(false)}>Back to Login</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}


export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
        router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <ShopHeader />
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <ShopHeader />
        <Login />
    </div>
  );
}
