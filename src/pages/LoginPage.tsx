import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Phone, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const LoginPage: React.FC = () => {
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobileNumber || mobileNumber.length < 10) {
            toast({
                variant: "destructive",
                title: "Invalid Mobile Number",
                description: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/admin/auth/send-otp', { mobileNumber });
            const { otp } = response.data.data;
            setStep('otp');
            toast({
                title: "OTP Sent",
                description: (
                    <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-foreground mb-1">Verification code sent to {mobileNumber}</p>
                        <p className="text-2xl font-bold tracking-[0.5em] text-primary">
                            {otp}
                        </p>
                    </div>
                ),
                duration: 10000,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to send OTP. Please check if the mobile number is registered.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "Please enter the 6-digit OTP sent to your mobile.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/admin/auth/verify-otp', { mobileNumber, otp });
            const { token, user } = response.data.data;
            login(token, user);
            toast({
                title: "Welcome back!",
                description: `Logged in as ${user.name || user.username}`,
            });
            navigate('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.response?.data?.message || "Invalid OTP. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            const response = await api.post('/admin/auth/resend-otp', { mobileNumber });
            const { otp } = response.data.data;
            toast({
                title: "OTP Resent",
                description: (
                    <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-foreground mb-1">New verification code sent to {mobileNumber}</p>
                        <p className="text-2xl font-bold tracking-[0.5em] text-primary">
                            {otp}
                        </p>
                    </div>
                ),
                duration: 10000,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to resend OTP. Please try again.",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                <div className="h-full bg-primary animate-pulse" style={{ width: '40%' }}></div>
            </div>

            <Card className="w-full max-w-[420px] shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 animate-fade-in">
                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        Admin Portal
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {step === 'mobile'
                            ? "Enter your admin mobile number to receive an OTP"
                            : `Enter the 6-digit code sent to ${mobileNumber}`}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 'mobile' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    className="pl-10 h-12 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all rounded-lg"
                                    disabled={isLoading}
                                    maxLength={10}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-semibold transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-primary/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(value) => setOtp(value)}
                                    disabled={isLoading}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                        <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                        <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                        <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                        <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                        <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-lg font-bold border-border shadow-sm rounded-lg" />
                                    </InputOTPGroup>
                                </InputOTP>
                                <div className="flex flex-col gap-2 w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs transition-colors"
                                        onClick={handleResendOtp}
                                        disabled={isLoading || isResending}
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                Resending...
                                            </>
                                        ) : (
                                            "Resend OTP"
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-semibold transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-primary/20"
                                disabled={isLoading || otp.length < 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Login
                                        <KeyRound className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-center text-muted-foreground px-4">
                        Secure access for authorized personnel only.
                        Unauthorized access is strictly prohibited.
                    </p>
                </CardFooter>
            </Card>

            {/* Background decorative elements */}
            <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -z-10 delay-1000 animate-pulse"></div>
        </div>
    );
};

export default LoginPage;
