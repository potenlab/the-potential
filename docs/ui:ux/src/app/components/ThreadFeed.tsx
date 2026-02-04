import { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Smile, TrendingUp, Image, X, Link2, Calendar, Bookmark } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { EmptyState } from './EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { mockPosts, type EventPost } from './EventBoard';
import { toast } from 'sonner';
import { UserProfile, type UserProfileData } from './UserProfile';
import { useAuth } from '../contexts/AuthContext';

interface Thread {
  id: number;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  images?: string[];
  replies?: Reply[];
}

interface Reply {
  id: number;
  author: string;
  role: string;
  content: string;
  timestamp: string;
}

const mockThreads: Thread[] = [];

interface ThreadFeedProps {
  onLoginClick?: () => void;
}

export function ThreadFeed({ onLoginClick }: ThreadFeedProps = {}) {
  const [threads, setThreads] = useState(mockThreads);
  const [newThread, setNewThread] = useState('');
  const [newThreadImages, setNewThreadImages] = useState<string[]>([]);
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedEventPost, setSelectedEventPost] = useState<EventPost | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<number | null>(null);
  const [editingThreadContent, setEditingThreadContent] = useState('');
  const [editingThreadImages, setEditingThreadImages] = useState<string[]>([]);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { currentUser } = useAuth();

  // Check if user is logged in and require login for certain actions
  const requireLogin = (action: () => void) => {
    if (!currentUser) {
      toast.error('로그인이 필요합니다', {
        description: '쓰레드를 작성하려면 먼저 로그인해주세요.',
      });
      if (onLoginClick) {
        console.log('🔑 로그인 모달 호출');
        onLoginClick();
      } else {
        console.warn('⚠️ onLoginClick이 전달되지 않았습니다');
      }
      return;
    }
    action();
  };

  // Common emojis for quick access
  const commonEmojis = ['😊', '👍', '🎉', '💡', '🚀', '💪', '🔥', '❤️', '✨', '🙏', '👏', '🤔'];

  // Function to detect and convert URLs to clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const url = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline hover:underline-offset-4 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // If a user profile is selected, show the profile view
  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  const toggleLike = (id: number) => {
    setThreads(threads.map(thread =>
      thread.id === id
        ? { ...thread, isLiked: !thread.isLiked, likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1 }
        : thread
    ));
  };

  const toggleExpand = (id: number) => {
    setExpandedThread(expandedThread === id ? null : id);
  };

  const handleSubmitThread = () => {
    if (!newThread.trim()) return;

    const newThreadObj: Thread = {
      id: Math.max(...threads.map(t => t.id)) + 1,
      author: currentUser,
      role: '스타트업 대표',
      content: newThread,
      timestamp: '방금 전',
      likes: 0,
      comments: 0,
      isLiked: false,
      tags: ['새글'],
      images: newThreadImages.length > 0 ? newThreadImages : undefined,
      replies: [],
    };

    setThreads([newThreadObj, ...threads]);
    setNewThread('');
    setNewThreadImages([]);
    setSelectedEventPost(null);
    toast.success('쓰레드가 성공적으로 등록되었습니다!');
  };

  const handleSubmitReply = (threadId: number) => {
    if (!replyText.trim()) return;

    setThreads(threads.map(thread => {
      if (thread.id === threadId) {
        const newReply: Reply = {
          id: (thread.replies?.length || 0) + 1,
          author: currentUser,
          role: '스타트업 대표',
          content: replyText,
          timestamp: '방금 전',
        };

        return {
          ...thread,
          replies: [...(thread.replies || []), newReply],
          comments: thread.comments + 1,
        };
      }
      return thread;
    }));

    setReplyText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = 5 - newThreadImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === filesToProcess) {
          setNewThreadImages([...newThreadImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setNewThreadImages(newThreadImages.filter((_, i) => i !== index));
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const remainingSlots = 5 - editingThreadImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === filesToProcess) {
          setEditingThreadImages([...editingThreadImages, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = (index: number) => {
    setEditingThreadImages(editingThreadImages.filter((_, i) => i !== index));
  };

  const handleBookmark = (thread: Thread) => {
    toast.success('🔖 쓰레드가 북마크되었습니다!', {
      description: '마이페이지에서 북마크한 쓰레드를 확인할 수 있습니다.',
    });
  };

  const handleEditThread = (id: number) => {
    const thread = threads.find(t => t.id === id);
    if (thread) {
      setEditingThreadId(id);
      setEditingThreadContent(thread.content);
      setEditingThreadImages(thread.images || []);
    }
  };

  const handleSaveEdit = (id: number) => {
    setThreads(threads.map(thread =>
      thread.id === id
        ? { ...thread, content: editingThreadContent, images: editingThreadImages.length > 0 ? editingThreadImages : undefined }
        : thread
    ));
    setEditingThreadId(null);
    setEditingThreadContent('');
    setEditingThreadImages([]);
    toast.success('쓰레드가 성공적으로 수정되었습니다!');
  };

  const handleDeleteThread = (id: number) => {
    if (window.confirm('정말로 이 쓰레드를 삭제하시겠습니까?')) {
      setThreads(threads.filter(thread => thread.id !== id));
      toast.success('쓰레드가 삭제되었습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditingThreadContent('');
    setEditingThreadImages([]);
  };

  const handleEditReply = (threadId: number, replyId: number) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread && thread.replies) {
      const reply = thread.replies.find(r => r.id === replyId);
      if (reply) {
        setEditingReplyId(replyId);
        setEditingReplyContent(reply.content);
      }
    }
  };

  const handleSaveEditReply = (threadId: number, replyId: number) => {
    setThreads(threads.map(thread => {
      if (thread.id === threadId && thread.replies) {
        const replies = thread.replies.map(reply => {
          if (reply.id === replyId) {
            return {
              ...reply,
              content: editingReplyContent,
            };
          }
          return reply;
        });

        return {
          ...thread,
          replies,
        };
      }
      return thread;
    }));

    setEditingReplyId(null);
    setEditingReplyContent('');
    toast.success('답글이 성공적으로 수정되었습니다!');
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyContent('');
  };

  const handleDeleteReply = (threadId: number, replyId: number) => {
    if (window.confirm('정말로 이 답글을 삭제하시겠습니까?')) {
      setThreads(threads.map(thread => {
        if (thread.id === threadId && thread.replies) {
          const replies = thread.replies.filter(reply => reply.id !== replyId);
          return {
            ...thread,
            replies,
            comments: thread.comments - 1,
          };
        }
        return thread;
      }));
      toast.success('답글이 삭제되었습니다.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">쓰레드</h2>
        <p className="text-muted-foreground text-base md:text-lg">창업가들과 자유롭게 소통하고 조언을 나눠보세요</p>
      </div>

      {/* New Thread */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl shadow-lg hover:border-border/60 transition-all">
        <CardContent className="pt-8">
          {currentUser ? (
            <div className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-white font-bold text-lg">
                  {currentUser[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="무엇이 궁금하신가요? 창업가들과 고민을 나눠보세요..."
                  value={newThread}
                  onChange={(e) => setNewThread(e.target.value)}
                  className="min-h-[120px] bg-[#0F0F0F] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground resize-none focus:border-primary transition-all"
                />
                
                {/* Image Previews */}
                {newThreadImages.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {newThreadImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-2xl border border-border/50"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Event Post Preview */}
                {selectedEventPost && (
                  <div className="mt-4">
                    <Card className="bg-card-secondary border-border rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1 font-semibold border text-xs">
                            {selectedEventPost.category}
                          </Badge>
                          <button
                            onClick={() => setSelectedEventPost(null)}
                            className="text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{selectedEventPost.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{selectedEventPost.content}</p>
                        {selectedEventPost.eventDate && (
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span className="text-xs text-white">{selectedEventPost.eventDate}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2 relative">
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="rounded-2xl text-muted-foreground hover:text-white hover:bg-card-secondary"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-[#1A1A1A] border border-border/50 rounded-2xl p-3 shadow-xl z-50">
                          <div className="flex flex-wrap gap-2 w-64">
                            {commonEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setNewThread(newThread + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="text-2xl hover:bg-card-secondary rounded-xl p-2 transition-all"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={newThreadImages.length >= 5}
                      className="rounded-2xl text-muted-foreground hover:text-white hover:bg-card-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Image className="h-5 w-5 mr-1" />
                      {newThreadImages.length > 0 && (
                        <span className="text-xs">({newThreadImages.length}/5)</span>
                      )}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                    
                    {/* Event Board Link */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-2xl text-muted-foreground hover:text-white hover:bg-card-secondary">
                          <Link2 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border rounded-3xl text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-white">내 게시글에서 가져오기</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            쓰레드에 연결할 내 게시물을 선택하세요
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-4 mt-4">
                          {mockPosts.filter(post => post.author === currentUser).length > 0 ? (
                            mockPosts.filter(post => post.author === currentUser).map((post) => (
                              <Card 
                                key={post.id} 
                                className="bg-card-secondary border-border/50 rounded-2xl hover:border-primary/30 transition-all cursor-pointer"
                                onClick={() => {
                                  setSelectedEventPost(post);
                                }}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between mb-3">
                                    <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1 font-semibold border text-xs">
                                      {post.category}
                                    </Badge>
                                    {post.isHot && (
                                      <Badge className="bg-red-500/10 text-red-400 border-red-500/30 rounded-xl px-3 py-1 font-semibold border text-xs">
                                        🔥 HOT
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-base font-bold text-white mb-2">{post.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">{post.author} · {post.timestamp}</span>
                                    </div>
                                    {post.eventDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-primary" />
                                        <span className="text-xs text-white">{post.eventDate}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">작성한 게시글이 없습니다</p>
                              <p className="text-sm text-muted-foreground mt-2">이벤트 게시판에서 먼저 게시글을 작성해보세요</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold" onClick={() => requireLogin(handleSubmitThread)}>
                    쓰레드 올리기
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-white font-semibold mb-2">쓰레드를 작성하려면 로그인이 필요합니다</p>
              <p className="text-muted-foreground mb-6">창업가들과 소통하고 조언을 나누려면 먼저 로그인해주세요</p>
              <Button 
                className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold"
                onClick={() => {
                  toast.error('로그인이 필요합니다', {
                    description: '쓰레드를 작성하려면 먼저 로그인해주세요.',
                  });
                  if (onLoginClick) {
                    onLoginClick();
                  }
                }}
              >
                로그인하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-primary/20 rounded-3xl shadow-lg">
        <CardContent className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-white text-lg">실시간 인기 토픽</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['#채용', '#투자유치', '#법인설립', '#마케팅전략', '#MVP개발', '#공동창업자'].map((tag) => (
              <Badge key={tag} className="bg-primary/10 text-primary border-0 rounded-xl px-4 py-2 hover:bg-primary/20 cursor-pointer transition-all font-semibold">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread List */}
      <div className="space-y-6">
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="아직 쓰레드가 없습니다"
            description="첫 번째 쓰레드를 작성하고 창업가들과 소통을 시작해보세요!"
          />
        ) : (
          threads.map((thread) => (
            <Card key={thread.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all shadow-lg">
              <CardContent className="pt-8">
                {/* Thread Header */}
                <div className="flex gap-4">
                  <Avatar 
                    className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => {
                      setSelectedUser({
                        name: thread.author,
                        title: thread.role,
                        stage: 'Stage 3',
                        avatar: thread.author[0],
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {thread.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p 
                          className="font-bold text-white text-lg cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            setSelectedUser({
                              name: thread.author,
                              title: thread.role,
                              stage: 'Stage 3',
                              avatar: thread.author[0],
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {thread.author}
                        </p>
                        <p className="text-sm text-muted-foreground">{thread.role} · {thread.timestamp}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-card-secondary">
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border rounded-2xl">
                          <DropdownMenuItem className="text-white cursor-pointer" onClick={() => handleBookmark(thread)}>북마크</DropdownMenuItem>
                          <DropdownMenuItem className="text-white cursor-pointer">신고하기</DropdownMenuItem>
                          {thread.author === currentUser && (
                            <>
                              <DropdownMenuItem className="text-white cursor-pointer" onClick={() => handleEditThread(thread.id)}>수정하기</DropdownMenuItem>
                              <DropdownMenuItem className="text-white cursor-pointer" onClick={() => handleDeleteThread(thread.id)}>삭제하기</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Thread Content */}
                    {editingThreadId === thread.id ? (
                      <>
                        <Textarea
                          value={editingThreadContent}
                          onChange={(e) => setEditingThreadContent(e.target.value)}
                          className="min-h-[120px] bg-[#0F0F0F] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground resize-none focus:border-primary transition-all"
                        />
                        
                        {/* Edit Image Previews */}
                        {editingThreadImages.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {editingThreadImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Edit ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-2xl border border-border/50"
                                />
                                <button
                                  onClick={() => removeEditImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Image Button in Edit Mode */}
                        <div className="mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={editingThreadImages.length >= 5}
                            className="rounded-2xl text-muted-foreground hover:text-white hover:bg-card-secondary disabled:opacity-50"
                          >
                            <Image className="h-5 w-5 mr-2" />
                            이미지 추가 {editingThreadImages.length > 0 && `(${editingThreadImages.length}/5)`}
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleEditImageUpload}
                            ref={editFileInputRef}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[#D1D5DB] leading-relaxed mb-4">{renderTextWithLinks(thread.content)}</p>
                    )}

                    {/* Thread Images - Only show when not editing */}
                    {!editingThreadId && thread.images && thread.images.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-3">
                        {thread.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Thread image ${index + 1}`}
                            className="max-h-80 max-w-full object-cover rounded-2xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {thread.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(thread.id)}
                        className={`rounded-2xl gap-2 ${thread.isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 hover:bg-red-500/10`}
                      >
                        <Heart className={`h-5 w-5 ${thread.isLiked ? 'fill-red-500' : ''}`} />
                        <span className="font-semibold">{thread.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(thread.id)}
                        className="rounded-2xl gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-semibold">{thread.comments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-2xl gap-2 text-muted-foreground hover:text-white hover:bg-card-secondary">
                        <Share2 className="h-5 w-5" />
                        <span className="font-semibold">공유</span>
                      </Button>
                    </div>

                    {/* Replies Section */}
                    {expandedThread === thread.id && (
                      <div className="mt-6 space-y-4">
                        {/* Existing Replies */}
                        {thread.replies && thread.replies.length > 0 && (
                          <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                            {thread.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar 
                                  className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                  onClick={() => {
                                    setSelectedUser({
                                      name: reply.author,
                                      title: reply.role,
                                      stage: 'Stage 2',
                                      avatar: reply.author[0],
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  <AvatarFallback className="bg-cyan-400/10 text-cyan-400 font-bold">
                                    {reply.author[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-card-secondary rounded-2xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p 
                                        className="font-semibold text-white text-sm cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => {
                                          setSelectedUser({
                                            name: reply.author,
                                            title: reply.role,
                                            stage: 'Stage 2',
                                            avatar: reply.author[0],
                                          });
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                      >
                                        {reply.author}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{reply.role} · {reply.timestamp}</p>
                                    </div>
                                    {thread.author === currentUser && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-card-secondary">
                                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-card border-border rounded-2xl">
                                          <DropdownMenuItem className="text-white cursor-pointer" onClick={() => handleEditReply(thread.id, reply.id)}>수정하기</DropdownMenuItem>
                                          <DropdownMenuItem className="text-white cursor-pointer" onClick={() => handleDeleteReply(thread.id, reply.id)}>삭제하기</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                  {editingReplyId === reply.id ? (
                                    <Input
                                      value={editingReplyContent}
                                      onChange={(e) => setEditingReplyContent(e.target.value)}
                                      className="h-12 bg-card-secondary border-border/50 rounded-2xl text-white placeholder:text-muted-foreground"
                                    />
                                  ) : (
                                    <p className="text-sm text-white leading-relaxed">{renderTextWithLinks(reply.content)}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {currentUser ? (
                          <div className="flex gap-3 pl-6">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-white font-bold">
                                {currentUser[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Input
                                placeholder="답글을 입력하세요..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="h-12 bg-card-secondary border-border/50 rounded-2xl text-white placeholder:text-muted-foreground"
                              />
                            </div>
                            <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-6 font-semibold" onClick={() => requireLogin(() => handleSubmitReply(thread.id))}>
                              답글
                            </Button>
                          </div>
                        ) : (
                          <div className="pl-6 text-center py-4 bg-card-secondary rounded-2xl">
                            <p className="text-sm text-muted-foreground">
                              답글을 작성하려면{' '}
                              <button
                                onClick={() => {
                                  toast.error('로그인이 필요합니다', {
                                    description: '답글을 작성하려면 먼저 로그인해주세요.',
                                  });
                                  if (onLoginClick) {
                                    onLoginClick();
                                  }
                                }}
                                className="text-primary hover:text-primary/80 underline font-semibold"
                              >
                                로그인
                              </button>
                              해주세요
                            </p>
                          </div>
                        )}

                        {/* Save Edit Button */}
                        {editingReplyId && (
                          <div className="mt-4 flex gap-3">
                            <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold" onClick={() => handleSaveEditReply(thread.id, editingReplyId)}>
                              수정 저장
                            </Button>
                            <Button className="rounded-2xl bg-muted text-white hover:bg-muted/80 px-8 font-semibold" onClick={handleCancelEditReply}>
                              취소
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save Edit Button */}
                    {editingThreadId === thread.id && (
                      <div className="mt-4 flex gap-3">
                        <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold" onClick={() => handleSaveEdit(thread.id)}>
                          수정 저장
                        </Button>
                        <Button className="rounded-2xl bg-muted text-white hover:bg-muted/80 px-8 font-semibold" onClick={handleCancelEdit}>
                          취소
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}