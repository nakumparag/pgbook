"use client";

import { useState, useEffect, useRef } from "react";
import { UserCircle, Save, Loader2, CheckCircle2, Camera, Shield, LogOut, Key, Eye, EyeOff, Mail, Phone, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetPhone, setResetPhone] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [isApprovedOwner, setIsApprovedOwner] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || null);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  useEffect(() => {
    async function checkOwnerStatus() {
      if (!user) return;
      const { data } = await supabase
        .from('owner_profiles')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      if (data?.status === 'APPROVED') {
        setIsApprovedOwner(true);
      }
    }
    checkOwnerStatus();
  }, [user, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await refreshProfile();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err: unknown) {
      console.error(err);
      setError("Unable to update your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      if (!user) throw new Error("Not authenticated");

      const file = event.target.files[0];
      
      // Validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a JPG, PNG, or WEBP image under 5 MB.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Please select a JPG, PNG, or WEBP image under 5 MB.");
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setIsUploading(true);

      const oldAvatarUrl = avatarUrl; // store current before uploading

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;
      
      // Auto-save the new avatar URL to the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      await refreshProfile();
      
      // Safely delete old avatar if it existed and was in the avatars bucket
      if (oldAvatarUrl && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
        try {
          const oldPath = oldAvatarUrl.split('/storage/v1/object/public/avatars/')[1];
          // Only attempt to delete if the path belongs to this user
          if (oldPath && oldPath.startsWith(`${user.id}/`)) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (delErr) {
          console.error("Failed to delete old avatar, ignoring:", delErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const validatePassword = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const passwordChecks = validatePassword(newPassword);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!isPasswordValid) {
      setPasswordError("Please meet all password requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Incorrect current password.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setIsResetLoading(true);

    try {
      if (resetMethod === "email") {
        const { error } = await supabase.auth.resetPasswordForEmail(user?.email || "", {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) throw error;
        setResetSuccess("Password reset instructions have been sent to your email.");
      } else if (resetMethod === "phone") {
        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: resetPhone,
          });
          if (error) throw error;
          setOtpSent(true);
          setResetSuccess("OTP sent successfully. Please enter it below.");
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: resetPhone,
            token: resetOtp,
            type: 'sms'
          });
          if (error) throw error;
          setResetSuccess("OTP verified successfully. You can now change your password above.");
          setTimeout(() => setIsResetModalOpen(false), 2000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || "An error occurred during password reset.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      router.push("/login");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  if (!user && !isLoading) {
    return (
      <div className="container-custom py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-10 md:py-16 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight">My Profile</h1>
        <p className="text-muted-foreground font-medium mt-2 text-lg">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-sm flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 border-4 border-background shadow-md flex items-center justify-center text-primary text-4xl font-bold relative">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  <span>{getInitials(fullName)}</span>
                )}
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </>
                  )}
                </button>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden" 
              />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-1">{fullName || "User"}</h2>
            <p className="text-muted-foreground text-sm mb-4">{user?.email}</p>
            
            <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wide border border-primary/20">
              {profile?.role || "USER"}
            </div>
          </div>
          
          {/* Account Security Card for Desktop (left column) or Mobile (bottom) */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm hidden lg:block">
            {isApprovedOwner && (
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Owner Access</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You are an approved owner. You can switch to the owner dashboard to manage your properties.
                </p>
                <Button 
                  onClick={() => router.push("/owner/dashboard")}
                  className="w-full py-6 rounded-xl font-semibold"
                >
                  Switch to Owner Dashboard
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-destructive/10 text-destructive rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Session</h3>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleLogout}
              className="w-full py-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out securely
            </Button>
          </div>
        </div>

        {/* Right Column: Profile Form & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-primary" />
              Personal Information
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20">
                {error}
              </div>
            )}
            
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                Profile updated successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <Input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="py-6 rounded-xl focus-visible:bg-transparent" 
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Phone Number</label>
                  <Input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="py-6 rounded-xl focus-visible:bg-transparent" 
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <Input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="py-6 rounded-xl bg-muted/50 cursor-not-allowed opacity-70 border-dashed" 
                />
                <p className="text-xs text-muted-foreground mt-1 ml-1">Email address cannot be changed here.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading || !user}
                  size="lg"
                  className="py-6 px-8 rounded-xl font-bold w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Account & Security
            </h2>

            {passwordError && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
                Password changed successfully.
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Current Password</label>
                <div className="relative">
                  <Input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="py-6 pr-12 rounded-xl focus-visible:bg-transparent" 
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <div className="relative">
                    <Input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="py-6 pr-12 rounded-xl focus-visible:bg-transparent" 
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {newPassword && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordChecks.length ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                        <span className={passwordChecks.length ? "text-green-600" : "text-muted-foreground"}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.uppercase ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                        <span className={passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.lowercase ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                        <span className={passwordChecks.lowercase ? "text-green-600" : "text-muted-foreground"}>One lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.number ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                        <span className={passwordChecks.number ? "text-green-600" : "text-muted-foreground"}>One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordChecks.special ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                        <span className={passwordChecks.special ? "text-green-600" : "text-muted-foreground"}>One special character</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="py-6 pr-12 rounded-xl focus-visible:bg-transparent" 
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword || !isPasswordValid || newPassword !== confirmPassword}
                  variant="outline"
                  size="lg"
                  className="py-6 px-8 rounded-xl font-bold w-full md:w-auto"
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-foreground mb-1">Forgot your password?</h3>
              <p className="text-sm text-muted-foreground mb-4">Reset it securely using your email or phone.</p>
              
              <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="rounded-xl">
                    Reset Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Choose how you want to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant={resetMethod === "email" ? "default" : "outline"} 
                      className="flex-1 rounded-xl"
                      onClick={() => { setResetMethod("email"); setResetError(null); setResetSuccess(null); }}
                    >
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                    <Button 
                      variant={resetMethod === "phone" ? "default" : "outline"} 
                      className="flex-1 rounded-xl"
                      onClick={() => { setResetMethod("phone"); setResetError(null); setResetSuccess(null); }}
                    >
                      <Phone className="w-4 h-4 mr-2" /> Phone / OTP
                    </Button>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20">
                      {resetError}
                    </div>
                  )}
                  
                  {resetSuccess && (
                    <div className="p-3 bg-green-100 text-green-800 rounded-xl text-sm font-medium flex items-start gap-2 border border-green-200">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>{resetSuccess}</div>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4 py-2">
                    {resetMethod === "email" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                        <Input 
                          type="email" 
                          value={user?.email || ""} 
                          disabled 
                          className="py-5 rounded-xl bg-muted/50" 
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-primary/10 text-primary-foreground rounded-xl text-xs flex items-start gap-2 mb-2 border border-primary/20 text-foreground">
                          <Info className="w-4 h-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">Only works if phone authentication is configured in your Supabase project.</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Phone Number</label>
                          <Input 
                            type="tel" 
                            value={resetPhone}
                            onChange={(e) => setResetPhone(e.target.value)}
                            disabled={otpSent}
                            required
                            placeholder="+91 XXXXX XXXXX"
                            className="py-5 rounded-xl" 
                          />
                        </div>
                        {otpSent && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">OTP</label>
                            <Input 
                              type="text" 
                              value={resetOtp}
                              onChange={(e) => setResetOtp(e.target.value)}
                              required
                              placeholder="_ _ _ _ _ _"
                              className="py-5 rounded-xl tracking-widest text-center text-lg" 
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isResetLoading || (resetMethod === "phone" && !resetPhone)}
                      className="w-full py-5 rounded-xl font-bold"
                    >
                      {isResetLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {resetMethod === "email" 
                        ? "Send Reset Link" 
                        : (otpSent ? "Verify OTP" : "Send OTP")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Mobile Logout (Hidden on desktop) */}
          <div className="lg:hidden block space-y-4">
            {isApprovedOwner && (
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Owner Access</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Switch to the owner dashboard to manage your properties.
                </p>
                <Button 
                  onClick={() => {
                    document.cookie = `pgbook-mode=owner; path=/; max-age=31536000; SameSite=Lax`;
                    router.push("/owner/dashboard");
                  }}
                  className="w-full py-6 rounded-xl font-semibold"
                >
                  Switch to Owner Dashboard
                </Button>
              </div>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleLogout}
              className="w-full py-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log out securely
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
