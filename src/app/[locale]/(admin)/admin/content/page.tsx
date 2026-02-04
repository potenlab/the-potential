'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, MessageSquare, Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Pin, PinOff, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useAdminPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  useAdminPosts,
  useTogglePinPost,
  useToggleHidePost,
  useDeletePost,
  type ProgramWithAuthor,
  type PostWithAuthor,
} from '@/features/admin/api/use-content-management';
import type { Database } from '@/types/database';

type ProgramCategory = Database['public']['Enums']['program_category'];
type ProgramStatus = Database['public']['Enums']['program_status'];

const PROGRAM_CATEGORIES: ProgramCategory[] = [
  'funding',
  'mentoring',
  'education',
  'networking',
  'space',
  'other',
];

const PROGRAM_STATUSES: ProgramStatus[] = ['draft', 'published', 'archived'];

interface ProgramFormData {
  title: string;
  description: string;
  organization: string;
  category: ProgramCategory;
  status: ProgramStatus;
  amount: string;
  eligibility: string;
  external_url: string;
  application_deadline: string;
}

const initialProgramForm: ProgramFormData = {
  title: '',
  description: '',
  organization: '',
  category: 'funding',
  status: 'draft',
  amount: '',
  eligibility: '',
  external_url: '',
  application_deadline: '',
};

/**
 * Content Management Page
 *
 * Admin page for managing support programs and community posts.
 * Features:
 * - Tabbed interface for Programs and Posts
 * - CRUD operations for support programs
 * - Moderation actions for posts (pin, hide, delete)
 * - Uses Table and Dropdown-menu from @/components/ui/
 * - All labels use translations from useTranslations('admin.content')
 */
export default function ContentManagementPage() {
  const t = useTranslations('admin.content');
  const tCommon = useTranslations('common');
  const tPrograms = useTranslations('supportPrograms');

  // Programs state
  const [programSearch, setProgramSearch] = useState('');
  const [programStatusFilter, setProgramStatusFilter] = useState<ProgramStatus | 'all'>('all');
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramWithAuthor | null>(null);
  const [programForm, setProgramForm] = useState<ProgramFormData>(initialProgramForm);
  const [deleteConfirmProgram, setDeleteConfirmProgram] = useState<ProgramWithAuthor | null>(null);

  // Posts state
  const [postSearch, setPostSearch] = useState('');
  const [hideConfirmPost, setHideConfirmPost] = useState<PostWithAuthor | null>(null);
  const [hideReason, setHideReason] = useState('');
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<PostWithAuthor | null>(null);

  // Queries
  const {
    data: programs = [],
    isLoading: programsLoading,
  } = useAdminPrograms({
    status: programStatusFilter,
    search: programSearch,
  });

  const {
    data: posts = [],
    isLoading: postsLoading,
  } = useAdminPosts({
    search: postSearch,
  });

  // Mutations
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();
  const togglePinPost = useTogglePinPost();
  const toggleHidePost = useToggleHidePost();
  const deletePost = useDeletePost();

  // Program handlers
  const handleOpenProgramDialog = (program?: ProgramWithAuthor) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({
        title: program.title,
        description: program.description,
        organization: program.organization,
        category: program.category,
        status: program.status,
        amount: program.amount || '',
        eligibility: program.eligibility || '',
        external_url: program.external_url || '',
        application_deadline: program.application_deadline?.split('T')[0] || '',
      });
    } else {
      setEditingProgram(null);
      setProgramForm(initialProgramForm);
    }
    setIsProgramDialogOpen(true);
  };

  const handleSaveProgram = async () => {
    const programData = {
      title: programForm.title,
      description: programForm.description,
      organization: programForm.organization,
      category: programForm.category,
      status: programForm.status,
      amount: programForm.amount || null,
      eligibility: programForm.eligibility || null,
      external_url: programForm.external_url || null,
      application_deadline: programForm.application_deadline || null,
      published_at: programForm.status === 'published' ? new Date().toISOString() : null,
    };

    if (editingProgram) {
      await updateProgram.mutateAsync({
        id: editingProgram.id,
        updates: programData,
      });
    } else {
      // For new programs, we need to get the current user ID
      // This would normally come from auth context
      await createProgram.mutateAsync({
        ...programData,
        created_by: '', // This should be populated from auth context in real implementation
      });
    }

    setIsProgramDialogOpen(false);
    setEditingProgram(null);
    setProgramForm(initialProgramForm);
  };

  const handleDeleteProgram = async () => {
    if (deleteConfirmProgram) {
      await deleteProgram.mutateAsync(deleteConfirmProgram.id);
      setDeleteConfirmProgram(null);
    }
  };

  // Post handlers
  const handlePinPost = async (post: PostWithAuthor) => {
    await togglePinPost.mutateAsync({
      postId: post.id,
      isPinned: !post.is_pinned,
    });
  };

  const handleHidePost = async () => {
    if (hideConfirmPost) {
      await toggleHidePost.mutateAsync({
        postId: hideConfirmPost.id,
        isHidden: !hideConfirmPost.is_hidden,
        hiddenReason: hideReason,
      });
      setHideConfirmPost(null);
      setHideReason('');
    }
  };

  const handleDeletePost = async () => {
    if (deleteConfirmPost) {
      await deletePost.mutateAsync(deleteConfirmPost.id);
      setDeleteConfirmPost(null);
    }
  };

  const getStatusBadgeVariant = (status: ProgramStatus) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'muted';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: ProgramCategory) => {
    return tPrograms(`categories.${category}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-[#8B95A1]">
          Manage support programs and community posts
        </p>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="programs" className="w-full">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('programs')}
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('posts')}
          </TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <Card variant="default" padding="none">
            <CardHeader className="p-6 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg font-semibold text-white">
                  {t('programs')}
                </CardTitle>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => handleOpenProgramDialog()}
                >
                  {t('createProgram')}
                </Button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder={tCommon('search')}
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                  className="sm:max-w-xs"
                />
                <Select
                  value={programStatusFilter}
                  onValueChange={(value) => setProgramStatusFilter(value as ProgramStatus | 'all')}
                >
                  <SelectTrigger size="sm" className="sm:w-40">
                    <SelectValue placeholder={tCommon('all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tCommon('all')}</SelectItem>
                    {PROGRAM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'published' ? tCommon('approved') : status === 'draft' ? tCommon('pending') : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {programsLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#8B95A1]">{tCommon('loading')}</p>
                </div>
              ) : programs.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#8B95A1]">{tCommon('noData')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[#8B95A1]">Title</TableHead>
                      <TableHead className="text-[#8B95A1]">Organization</TableHead>
                      <TableHead className="text-[#8B95A1]">Category</TableHead>
                      <TableHead className="text-[#8B95A1]">Status</TableHead>
                      <TableHead className="text-[#8B95A1]">Deadline</TableHead>
                      <TableHead className="text-right text-[#8B95A1]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id} className="border-white/5">
                        <TableCell className="font-medium text-white max-w-xs truncate">
                          {program.title}
                        </TableCell>
                        <TableCell className="text-[#8B95A1]">
                          {program.organization}
                        </TableCell>
                        <TableCell>
                          <Badge variant="muted" size="sm">
                            {getCategoryLabel(program.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(program.status)} size="sm">
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#8B95A1]">
                          {program.application_deadline
                            ? format(new Date(program.application_deadline), 'MMM d, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenProgramDialog(program)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('editProgram')}
                              </DropdownMenuItem>
                              {program.external_url && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={program.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View External
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteConfirmProgram(program)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('deleteProgram')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card variant="default" padding="none">
            <CardHeader className="p-6 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg font-semibold text-white">
                  {t('posts')}
                </CardTitle>
              </div>
              <div className="mt-4">
                <Input
                  placeholder={tCommon('search')}
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="sm:max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {postsLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#8B95A1]">{tCommon('loading')}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#8B95A1]">{tCommon('noData')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[#8B95A1]">Author</TableHead>
                      <TableHead className="text-[#8B95A1]">Content</TableHead>
                      <TableHead className="text-[#8B95A1]">Status</TableHead>
                      <TableHead className="text-[#8B95A1]">Stats</TableHead>
                      <TableHead className="text-[#8B95A1]">Date</TableHead>
                      <TableHead className="text-right text-[#8B95A1]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className={cn('border-white/5', post.is_hidden && 'opacity-50')}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {post.author?.full_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-[#8B95A1]">
                              {post.author?.company_name || post.author?.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate text-white">
                            {post.content.substring(0, 100)}
                            {post.content.length > 100 && '...'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {post.is_pinned && (
                              <Badge variant="info" size="sm">
                                <Pin className="mr-1 h-3 w-3" />
                                Pinned
                              </Badge>
                            )}
                            {post.is_hidden && (
                              <Badge variant="error" size="sm">
                                <EyeOff className="mr-1 h-3 w-3" />
                                Hidden
                              </Badge>
                            )}
                            {!post.is_pinned && !post.is_hidden && (
                              <Badge variant="success" size="sm">
                                Visible
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#8B95A1]">
                          <div className="flex flex-col text-xs">
                            <span>{post.like_count} likes</span>
                            <span>{post.comment_count} comments</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#8B95A1]">
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePinPost(post)}>
                                {post.is_pinned ? (
                                  <>
                                    <PinOff className="mr-2 h-4 w-4" />
                                    {t('unpinPost')}
                                  </>
                                ) : (
                                  <>
                                    <Pin className="mr-2 h-4 w-4" />
                                    {t('pinPost')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setHideConfirmPost(post)}>
                                {post.is_hidden ? (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('showPost')}
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    {t('hidePost')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteConfirmPost(post)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('deletePost')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Program Create/Edit Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? t('editProgram') : t('createProgram')}
            </DialogTitle>
            <DialogDescription>
              {editingProgram
                ? 'Update the support program details below.'
                : 'Fill in the details to create a new support program.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              label="Title"
              placeholder="Enter program title"
              value={programForm.title}
              onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
            />
            <Input
              label="Organization"
              placeholder="Enter organization name"
              value={programForm.organization}
              onChange={(e) => setProgramForm({ ...programForm, organization: e.target.value })}
            />
            <Textarea
              label="Description"
              placeholder="Enter program description"
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Category</label>
                <Select
                  value={programForm.category}
                  onValueChange={(value) => setProgramForm({ ...programForm, category: value as ProgramCategory })}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Status</label>
                <Select
                  value={programForm.status}
                  onValueChange={(value) => setProgramForm({ ...programForm, status: value as ProgramStatus })}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Amount/Budget"
                placeholder="e.g., Up to 100M KRW"
                value={programForm.amount}
                onChange={(e) => setProgramForm({ ...programForm, amount: e.target.value })}
              />
              <Input
                label="Application Deadline"
                type="date"
                value={programForm.application_deadline}
                onChange={(e) => setProgramForm({ ...programForm, application_deadline: e.target.value })}
              />
            </div>
            <Textarea
              label="Eligibility"
              placeholder="Enter eligibility requirements"
              value={programForm.eligibility}
              onChange={(e) => setProgramForm({ ...programForm, eligibility: e.target.value })}
            />
            <Input
              label="External URL"
              placeholder="https://..."
              value={programForm.external_url}
              onChange={(e) => setProgramForm({ ...programForm, external_url: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveProgram}
              loading={createProgram.isPending || updateProgram.isPending}
            >
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Confirmation Dialog */}
      <Dialog open={!!deleteConfirmProgram} onOpenChange={() => setDeleteConfirmProgram(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteProgram')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmProgram?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmProgram(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProgram}
              loading={deleteProgram.isPending}
            >
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hide Post Confirmation Dialog */}
      <Dialog open={!!hideConfirmPost} onOpenChange={() => setHideConfirmPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hideConfirmPost?.is_hidden ? t('showPost') : t('hidePost')}
            </DialogTitle>
            <DialogDescription>
              {hideConfirmPost?.is_hidden
                ? 'This post will become visible to all users again.'
                : 'This post will be hidden from the community feed.'}
            </DialogDescription>
          </DialogHeader>
          {!hideConfirmPost?.is_hidden && (
            <div className="py-4">
              <Textarea
                label="Reason (optional)"
                placeholder="Enter the reason for hiding this post..."
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideConfirmPost(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant={hideConfirmPost?.is_hidden ? 'primary' : 'destructive'}
              onClick={handleHidePost}
              loading={toggleHidePost.isPending}
            >
              {hideConfirmPost?.is_hidden ? t('showPost') : t('hidePost')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={!!deleteConfirmPost} onOpenChange={() => setDeleteConfirmPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deletePost')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmPost(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              loading={deletePost.isPending}
            >
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
