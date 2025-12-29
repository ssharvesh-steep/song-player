"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UploadForm from "@/components/admin/UploadForm";
import SongList from "@/components/admin/SongList";

const AdminPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setError("You must be logged in to access this page");
                    setTimeout(() => router.push("/login"), 2000);
                    return;
                }

                const { data, error: profileError } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    setError("Error checking admin status. Please ensure your profile exists.");
                    console.error("Profile error:", profileError);
                    setTimeout(() => router.push("/"), 2000);
                    return;
                }

                if (data?.is_admin) {
                    setIsAdmin(true);
                } else {
                    setError("Access denied. Admin privileges required.");
                    setTimeout(() => router.push("/"), 2000);
                }
            } catch (err) {
                console.error("Admin check error:", err);
                setError("An unexpected error occurred");
                setTimeout(() => router.push("/"), 2000);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-white">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg max-w-md">
                    <h2 className="font-bold text-lg mb-2">Access Error</h2>
                    <p>{error}</p>
                    <p className="text-sm mt-2 text-red-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">Upload New Song</h2>
                        <UploadForm />
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">Song Library</h2>
                        <SongList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
