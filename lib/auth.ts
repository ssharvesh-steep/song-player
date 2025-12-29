import { supabase } from './supabase';

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function isAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (error || !data) return false;
    return data.is_admin === true;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signUp(email: string, password: string, username?: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username || email.split('@')[0],
            }
        }
    });

    if (error) throw error;

    // Create profile entry
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                email: email,
                username: username || email.split('@')[0],
                is_admin: false,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error(`Failed to create profile: ${profileError.message}`);
        }
    }

    return data;
}
