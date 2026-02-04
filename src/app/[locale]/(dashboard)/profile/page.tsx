'use client';

/**
 * Profile Page
 *
 * User profile page with:
 * - Profile completeness percentage calculation
 * - Editable sections using Dialog-based forms
 * - Changes persist to database via Supabase
 * - Profile photo upload capability
 * - Uses Avatar, Badge, Progress, Accordion from @/components/ui/
 * - All labels use translations from useTranslations('profile')
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Camera,
  Edit2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import {
  EditAboutDialog,
  EditSocialDialog,
  EditExpertiseDialog,
} from '@/features/profile/components';

import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SocialLinks {
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
}

interface ExpertiseData {
  position?: string | null;
  experience_years?: number | null;
  skills?: string[];
  industry?: string | null;
}

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate profile completeness percentage
 */
function calculateCompleteness(
  profile: Profile | null,
  socialLinks: SocialLinks,
  expertise: ExpertiseData
): number {
  if (!profile) return 0;

  const fields = [
    { field: profile.full_name, weight: 20 },
    { field: profile.avatar_url, weight: 15 },
    { field: profile.company_name, weight: 15 },
    { field: profile.email, weight: 15 },
    { field: expertise.position, weight: 10 },
    { field: expertise.skills && expertise.skills.length > 0, weight: 10 },
    { field: socialLinks.linkedin || socialLinks.website, weight: 10 },
    { field: expertise.industry, weight: 5 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const achievedWeight = fields
    .filter((f) => {
      if (typeof f.field === 'boolean') return f.field === true;
      return f.field && String(f.field).trim() !== '';
    })
    .reduce((sum, f) => sum + f.weight, 0);

  return Math.min(100, Math.round((achievedWeight / totalWeight) * 100));
}

/**
 * Info Row Component for displaying profile data
 */
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  const displayValue = value || '-';

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted" />}
        {href && value ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {displayValue}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="font-medium text-white">{displayValue}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Profile Page Component
 */
export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  // State
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dialog states
  const [aboutDialogOpen, setAboutDialogOpen] = React.useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = React.useState(false);
  const [expertiseDialogOpen, setExpertiseDialogOpen] = React.useState(false);

  // Extended data (would be stored in separate tables or JSONB in real implementation)
  const [socialLinks, setSocialLinks] = React.useState<SocialLinks>({
    website: null,
    linkedin: null,
    twitter: null,
    github: null,
  });

  const [expertise, setExpertise] = React.useState<ExpertiseData>({
    position: null,
    experience_years: null,
    skills: [],
    industry: null,
  });

  // Fetch profile data
  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profileData) {
        console.error('Error fetching profile:', error);
        return;
      }

      const typedProfile = profileData as Profile;
      setProfile(typedProfile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle about section update
  const handleAboutUpdate = (updatedData: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  // Handle social links update
  const handleSocialUpdate = (updatedLinks: SocialLinks) => {
    setSocialLinks(updatedLinks);
  };

  // Handle expertise update
  const handleExpertiseUpdate = (updatedExpertise: ExpertiseData) => {
    setExpertise(updatedExpertise);
  };

  // Calculate completeness
  const completeness = calculateCompleteness(profile, socialLinks, expertise);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted" />
        <p className="text-muted">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-muted">{t('completenessDescription')}</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar with upload */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110" />
              <Avatar size="xl" className="relative border-4 border-card">
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                  />
                ) : null}
                <AvatarFallback>
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full',
                  'bg-black/60 opacity-0 transition-opacity duration-200',
                  'group-hover:opacity-100',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary',
                  uploadingAvatar && 'opacity-100'
                )}
                aria-label={t('avatar.change')}
              >
                {uploadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label={t('avatar.upload')}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h2 className="text-2xl font-bold text-white">
                  {profile.full_name || 'Anonymous User'}
                </h2>
                {profile.approval_status === 'approved' && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {tCommon('approved')}
                  </Badge>
                )}
                {profile.approval_status === 'pending' && (
                  <Badge variant="warning" size="sm">
                    {tCommon('pending')}
                  </Badge>
                )}
              </div>

              {profile.company_name && (
                <p className="mt-1 text-muted">{profile.company_name}</p>
              )}

              <p className="mt-2 text-sm text-muted">{profile.email}</p>

              {/* Role badge */}
              <div className="mt-3">
                <Badge variant="default" size="md">
                  {profile.role === 'admin'
                    ? 'Administrator'
                    : profile.role === 'expert'
                      ? 'Expert'
                      : 'Member'}
                </Badge>
              </div>
            </div>

            {/* Completeness */}
            <div className="w-full md:w-48">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-sm font-medium text-muted">
                  {t('completeness')}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">
                    {completeness}%
                  </span>
                </div>
                <Progress
                  value={completeness}
                  size="md"
                  indicatorColor={
                    completeness >= 80
                      ? 'success'
                      : completeness >= 50
                        ? 'warning'
                        : 'primary'
                  }
                  className="mt-3"
                />
                {completeness < 100 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto text-xs"
                  >
                    {t('completeProfile')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card variant="default" padding="none">
          <Accordion type="multiple" defaultValue={['about']} className="w-full">
            {/* About Section */}
            <AccordionItem value="about" className="border-white/[0.08] px-6">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>{t('sections.about')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAboutDialogOpen(true)}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                      icon={User}
                      label={t('fields.name')}
                      value={profile.full_name}
                    />
                    <InfoRow
                      icon={Building2}
                      label={t('fields.company')}
                      value={profile.company_name}
                    />
                  </div>
                  <InfoRow
                    icon={Mail}
                    label={t('fields.email')}
                    value={profile.email}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Expertise Section */}
            <AccordionItem value="expertise" className="border-white/[0.08] px-6">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>{t('sections.expertise')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpertiseDialogOpen(true)}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                  {expertise.position ||
                  expertise.industry ||
                  (expertise.skills && expertise.skills.length > 0) ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoRow
                          label={t('fields.position')}
                          value={expertise.position}
                        />
                        <InfoRow
                          label="Industry"
                          value={
                            expertise.industry
                              ?.replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase()) || null
                          }
                        />
                      </div>
                      {expertise.experience_years && (
                        <InfoRow
                          label="Years of Experience"
                          value={`${expertise.experience_years} years`}
                        />
                      )}
                      {expertise.skills && expertise.skills.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                          <p className="text-xs text-muted">
                            {t('sections.skills')}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {expertise.skills.map((skill) => (
                              <Badge key={skill} variant="default" size="sm">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-sm text-muted">
                        No expertise information added yet.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto"
                        onClick={() => setExpertiseDialogOpen(true)}
                      >
                        Add your expertise
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Links Section */}
            <AccordionItem
              value="social"
              className="border-white/[0.08] border-b-0 px-6"
            >
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Social & Links</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSocialDialogOpen(true)}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                  {socialLinks.website ||
                  socialLinks.linkedin ||
                  socialLinks.twitter ||
                  socialLinks.github ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {socialLinks.website && (
                        <InfoRow
                          icon={Globe}
                          label={t('fields.website')}
                          value={socialLinks.website}
                          href={socialLinks.website}
                        />
                      )}
                      {socialLinks.linkedin && (
                        <InfoRow
                          icon={Linkedin}
                          label={t('fields.linkedin')}
                          value={socialLinks.linkedin}
                          href={
                            socialLinks.linkedin.startsWith('http')
                              ? socialLinks.linkedin
                              : `https://linkedin.com/in/${socialLinks.linkedin}`
                          }
                        />
                      )}
                      {socialLinks.twitter && (
                        <InfoRow
                          icon={Twitter}
                          label={t('fields.twitter')}
                          value={socialLinks.twitter}
                          href={
                            socialLinks.twitter.startsWith('http')
                              ? socialLinks.twitter
                              : `https://twitter.com/${socialLinks.twitter.replace('@', '')}`
                          }
                        />
                      )}
                      {socialLinks.github && (
                        <InfoRow
                          icon={Github}
                          label={t('fields.github')}
                          value={socialLinks.github}
                          href={
                            socialLinks.github.startsWith('http')
                              ? socialLinks.github
                              : `https://github.com/${socialLinks.github}`
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-sm text-muted">
                        No social links added yet.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto"
                        onClick={() => setSocialDialogOpen(true)}
                      >
                        Add your social links
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </motion.div>

      {/* Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>{t('activity.title')}</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="mt-1 text-xs text-muted">{t('activity.posts')}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="mt-1 text-xs text-muted">
                  {t('activity.comments')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="mt-1 text-xs text-muted">{t('activity.likes')}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="mt-1 text-xs text-muted">
                  {t('activity.bookmarks')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialogs */}
      <EditAboutDialog
        open={aboutDialogOpen}
        onOpenChange={setAboutDialogOpen}
        profile={profile}
        onSuccess={handleAboutUpdate}
      />

      <EditSocialDialog
        open={socialDialogOpen}
        onOpenChange={setSocialDialogOpen}
        currentValues={socialLinks}
        profileId={profile.id}
        onSuccess={handleSocialUpdate}
      />

      <EditExpertiseDialog
        open={expertiseDialogOpen}
        onOpenChange={setExpertiseDialogOpen}
        currentValues={expertise}
        profileId={profile.id}
        onSuccess={handleExpertiseUpdate}
      />
    </div>
  );
}
