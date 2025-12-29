"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '@/lib/password-reset';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setError(null);
            setLoading(true);
            await resetPassword(data.email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-6 py-8 rounded-lg text-center">
                    <Mail className="mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                    <p className="mb-4">
                        We've sent you a password reset link. Please check your inbox and follow the instructions.
                    </p>
                    <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold">
                        ← Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <Link href="/login" className="flex items-center gap-2 text-neutral-400 hover:text-white transition mb-4">
                        <ArrowLeft size={20} />
                        <span>Back to login</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Reset password</h2>
                    <p className="text-neutral-400">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <Input
                        type="email"
                        placeholder="Email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                        disabled={loading}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full transition"
                >
                    {loading ? 'Sending...' : 'Send reset link'}
                </Button>
            </form>
        </div>
    );
}
