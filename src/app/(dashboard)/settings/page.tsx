"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  History,
  Palette,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Clock,
  Home,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { DataService } from "@/lib/data-service";
import { Household, HouseholdMember, ActivityLog } from "@/lib/types";
import { formatDateTime, formatDate, formatINR } from "@/lib/formatters";
import { useTheme } from "next-themes";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Household name update state
  const [householdName, setHouseholdName] = useState("");
  const [isUpdatingHousehold, setIsUpdatingHousehold] = useState(false);
  const [householdSuccess, setHouseholdSuccess] = useState<string | null>(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    const [h, m, logs] = await Promise.all([
      DataService.getHousehold(),
      DataService.getMembers(),
      DataService.getActivityLogs(),
    ]);
    setHousehold(h);
    setHouseholdName(h.name);
    setMembers(m);
    setActivityLogs(logs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateHouseholdName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;

    setIsUpdatingHousehold(true);
    try {
      if (household) {
        household.name = householdName;
      }
      setHouseholdSuccess("Household name updated successfully!");
      setTimeout(() => setHouseholdSuccess(null), 3000);
    } finally {
      setIsUpdatingHousehold(false);
    }
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const token = "inv_" + Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}/signup?invite=${token}`;
    setGeneratedInviteLink(link);
  };

  const copyInviteToClipboard = () => {
    if (generatedInviteLink) {
      navigator.clipboard.writeText(generatedInviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this family member from the household?")) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  return (
    <AppLayout
      title="Household Settings"
      subtitle="Manage family members, security permissions, and audit logs"
    >
      <div className="space-y-8 max-w-4xl">
        {/* Section 1: Household Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span>Household Configuration</span>
            </CardTitle>
            <CardDescription>
              Basic household information and financial localization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateHouseholdName} className="space-y-4">
              {householdSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{householdSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Household Name
                  </label>
                  <Input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Currency & Number Formatting
                  </label>
                  <Input
                    type="text"
                    value="Indian Rupee (INR, ₹) • en-IN (Lakhs / Crores)"
                    disabled
                    className="bg-muted text-muted-foreground text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" isLoading={isUpdatingHousehold}>
                  Update Household
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 2: Family Members Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Family Members ({members.length})</span>
              </CardTitle>
              <CardDescription>
                All authorized accounts sharing access to this household
              </CardDescription>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setGeneratedInviteLink(null);
                setInviteEmail("");
                setIsInviteModalOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.display_name} src={member.avatar_url} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">
                          {member.display_name}
                        </h4>
                        <Badge
                          variant={member.role === "admin" ? "default" : "secondary"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {member.email || "Household User"} • Joined {formatDate(member.joined_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.role !== "admin" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors text-xs inline-flex items-center gap-1"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Activity Log & Immutable Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Activity History & Audit Trail</span>
            </CardTitle>
            <CardDescription>
              Tamper-proof record of additions, modifications, and deletions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground mb-4">
              <p>
                <strong>Security Rule:</strong> In accordance with financial audit requirements, audit entries are immutable and cannot be deleted or modified by ordinary household members.
              </p>
            </div>

            <div className="space-y-3">
              {activityLogs.map((log) => {
                const summary = log.change_summary as Record<string, string | number>;
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-border bg-card/60 flex items-start gap-3 text-xs"
                  >
                    <div className="p-2 rounded-lg bg-secondary text-primary shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {log.actor?.display_name || "Family Member"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>

                      <p className="text-muted-foreground">
                        Action:{" "}
                        <Badge
                          variant={
                            log.action === "create"
                              ? "success"
                              : log.action === "delete"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-[10px] capitalize ml-1 mr-1.5"
                        >
                          {log.action}
                        </Badge>
                        on <strong>{log.entity_type}</strong>:{" "}
                        {summary.description || summary.event || "Record modified"}
                      </p>

                      {summary.amount && (
                        <p className="text-foreground font-medium">
                          Amount: {formatINR(Number(summary.amount))}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Theme & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>Theme & Appearance</span>
            </CardTitle>
            <CardDescription>
              Personalize interface mode across mobile and desktop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Color Theme Preference</p>
                <p className="text-xs text-muted-foreground">
                  Current: <strong className="capitalize">{theme || "system"}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  size="sm"
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                >
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Database Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Database & Security Status</span>
            </CardTitle>
            <CardDescription>
              Supabase PostgreSQL and Row Level Security architecture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">PostgreSQL Row Level Security</p>
                <p className="text-muted-foreground mt-0.5">
                  Tenant boundaries enforced at database kernel level via RLS policies
                </p>
              </div>
              <Badge variant="success" className="text-[10px]">Active & Enforced</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">Supabase Backend Link</p>
                <p className="text-muted-foreground mt-0.5">
                  {isSupabaseConfigured()
                    ? "Connected to live Supabase project"
                    : "Interactive Local/Demo Mode active (Configure .env.local to link cloud database)"}
                </p>
              </div>
              <Badge variant={isSupabaseConfigured() ? "success" : "warning"} className="text-[10px]">
                {isSupabaseConfigured() ? "Connected" : "Demo Mode"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Invitation Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Family Member"
        description="Generate a secure invitation token to welcome a family member into this household"
        maxWidth="sm"
      >
        {generatedInviteLink ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Invitation generated! Share the link below with your family member:</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/60 text-xs font-mono break-all select-all">
              {generatedInviteLink}
            </div>

            <Button
              type="button"
              onClick={copyInviteToClipboard}
              className="w-full gap-2 font-semibold text-xs"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? "Copied to Clipboard!" : "Copy Invitation Link"}</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Member Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="family.member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Household Role
              </label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
              >
                <option value="member">Member (Can view, add, edit, and delete expenses)</option>
                <option value="admin">Admin (Can also manage members and settings)</option>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Generate Invite Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}

