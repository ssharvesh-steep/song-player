"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setError(null);
            setLoading(true);
            await signUp(data.email, data.password, data.username);
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
                    <p className="text-neutral-400">Sign up to start listening</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <Input
                        type="text"
                        placeholder="Username"
                        {...register('username', {
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                            }
                        })}
                        disabled={loading}
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                </div>

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
                </div>

                <div>
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                        })}
                        disabled={loading}
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full transition"
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <div className="text-center">
                    <p className="text-neutral-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-green-500 hover:text-green-400 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
