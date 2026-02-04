"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProfile } from "@/actions/settings";
import { useToast } from "@/components/ui/toast";
import { Shield } from "lucide-react";

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile) {
        setTwoFactorEnabled(profile.twoFactorEnabled);
      }
    });
  }, []);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/setup", { method: "POST" });
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setShowSetup(true);
      }
    } catch {
      toast({ title: "Error", description: "Failed to set up 2FA", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setShowSetup(false);
        toast({ title: "2FA enabled" });
      } else {
        toast({ title: "Invalid code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/disable", { method: "POST" });
      if (res.ok) {
        setTwoFactorEnabled(false);
        toast({ title: "2FA disabled" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage your security settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {twoFactorEnabled ? (
              <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={handleEnable2FA} disabled={loading}>
                Enable 2FA
              </Button>
            )}
          </div>

          {showSetup && qrCode && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyCode">Enter the code from your app</Label>
                <Input
                  id="verifyCode"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="max-w-[200px]"
                />
              </div>
              <Button onClick={handleVerify2FA} disabled={loading || verifyCode.length !== 6}>
                Verify and Enable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
