"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null);
            setLoading(true);
            await signIn(data.email, data.password);
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                    <p className="text-neutral-400">Sign in to your account</p>
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

                <div>
                    <Input
                        type="password"
                        placeholder="Password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                            }
                        })}
                        disabled={loading}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                    <div className="text-right mt-2">
                        <Link href="/forgot-password" className="text-sm text-neutral-400 hover:text-green-400 transition">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full transition"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center">
                    <p className="text-neutral-400">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-green-500 hover:text-green-400 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
