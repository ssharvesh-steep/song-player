"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { updatePassword } from '@/lib/password-reset';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

export default function ResetPasswordForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();

    const password = watch('password');

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setError(null);
            setLoading(true);
            await updatePassword(data.password);
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Set new password</h2>
                    <p className="text-neutral-400">Enter your new password below</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <Input
                        type="password"
                        placeholder="New Password"
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
                    {loading ? 'Updating...' : 'Update password'}
                </Button>
            </form>
        </div>
    );
}
