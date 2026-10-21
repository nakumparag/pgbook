"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, CheckCircle2, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, profile, loading, isOwner, refreshProfile, signOut } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setAvatarUrl(profile?.avatar_url || null);
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (fullName.trim().length < 2) {
      setError("Enter your name (at least 2 characters).");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, avatar_url: avatarUrl })
      .eq("id", user.id);
    if (updateError) setError("Couldn't save your profile. Please try again.");
    else {
      await refreshProfile();
      setNotice("Profile saved.");
    }
    setSaving(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG, or WEBP image under 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (uploadError) {
      setError("Couldn't upload your photo. Please try again.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    if (updateError) setError("Photo uploaded, but your profile couldn't be updated. Try uploading again.");
    else {
      setAvatarUrl(data.publicUrl);
      await refreshProfile();
      setNotice("Profile photo updated.");
    }
    setUploading(false);
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    setError("");
    setNotice("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError("Couldn't send the reset email. Please try again.");
    else setNotice("Password reset link sent to your email.");
    setSendingReset(false);
  };

  const logout = async () => {
    await signOut();
    router.replace("/login");
  };

  if (loading || !user) {
    return <div className="container-custom flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading profile" /></div>;
  }

  const initials = fullName.trim().slice(0, 2).toUpperCase() || "U";

  return (
    <div className="container-custom max-w-5xl py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground">My Profile</h1>
        <p className="mt-2 text-muted-foreground">Update your account details and sign-in security.</p>
      </header>

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`mb-6 flex items-start gap-2 rounded-xl border p-4 text-sm ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-success/30 bg-success/10 text-success"}`}>
          {notice && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          {error || notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} aria-label="Change profile photo" className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow">
              {avatarUrl ? <Image src={avatarUrl} alt="Profile photo" fill className="object-cover" unoptimized /> : initials}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1.5 text-xs font-semibold text-white">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Camera className="h-3.5 w-3.5" /> Edit</>}
              </span>
            </button>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={uploadAvatar} />
            <h2 className="font-bold text-foreground">{fullName || "Your account"}</h2>
            <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" /> {profile?.role || "USER"}
            </span>
          </section>

          <section className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
            {profile?.role === "ADMIN" && <Button asChild variant="outline" className="w-full rounded-xl"><Link href="/admin/dashboard"><ShieldCheck className="mr-2 h-4 w-4" />Admin dashboard</Link></Button>}
            {isOwner && <Button asChild variant="outline" className="w-full rounded-xl"><Link href="/owner/dashboard">Owner dashboard</Link></Button>}
            <Button type="button" variant="ghost" onClick={logout} className="w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          </section>
        </aside>

        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
            <h2 className="mb-5 text-xl font-bold text-foreground">Personal details</h2>
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-foreground">Full name
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} autoComplete="name" className="h-12 rounded-xl" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-foreground">Phone number
                  <Input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className="h-12 rounded-xl" placeholder="Add a phone number" />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-semibold text-foreground">Email address
                <Input type="email" value={user.email || ""} disabled className="h-12 rounded-xl bg-muted/60" />
              </label>
              <Button type="submit" disabled={saving} className="w-full rounded-xl sm:w-auto">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save profile"}
              </Button>
            </form>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div>
              <h2 className="font-bold text-foreground">Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">We’ll email you a secure link to choose a new password.</p>
            </div>
            <Button type="button" variant="outline" onClick={sendPasswordReset} disabled={sendingReset || !user.email} className="shrink-0 rounded-xl">
              {sendingReset ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : "Send reset link"}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
