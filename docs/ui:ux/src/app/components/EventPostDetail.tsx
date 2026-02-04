import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Calendar, MapPin, Link as LinkIcon, Trash2, CornerDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { EventPost } from './EventBoard';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

interface Comment {
  id: number;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface EventPostDetailProps {
  post: EventPost;
  onBack: () => void;
}

export function EventPostDetail({ post, onBack }: EventPostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '박성공',
      authorRole: 'SaaS 스타트업 대표',
      content: '정말 유익한 행사네요! 참석 신청했습니다 👍',
      timestamp: '1시간 전',
      likes: 12,
      replies: [
        {
          id: 101,
          author: '김네트워킹',
          authorRole: '이벤트 기획자',
          content: '감사합니다! 현장에서 뵙겠습니다 😊',
          timestamp: '30분 전',
          likes: 3,
        }
      ]
    },
    {
      id: 2,
      author: '이혁신',
      authorRole: 'AI 스타트업 CTO',
      content: '시간이 맞지 않아 아쉽네요. 다음 행사는 꼭 참석하고 싶습니다!',
      timestamp: '2시간 전',
      likes: 8,
    },
    {
      id: 3,
      author: '최창업',
      authorRole: '예비 창업가',
      content: '이런 행사 너무 좋아요. 더포텐셜 최고!',
      timestamp: '3시간 전',
      likes: 15,
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now(),
        author: '김창업',
        authorRole: 'AI 스타트업 대표',
        content: newComment,
        timestamp: '방금 전',
        likes: 0,
        replies: []
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId: number) => {
    if (replyContent.trim()) {
      const newReply: Comment = {
        id: Date.now(),
        author: '김창업',
        authorRole: 'AI 스타트업 대표',
        content: replyContent,
        timestamp: '방금 전',
        likes: 0,
      };

      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));

      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleDeleteReply = (commentId: number, replyId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== replyId)
        };
      }
      return comment;
    }));
  };

  const getCategoryColor = (category: EventPost['category']) => {
    switch (category) {
      case '행사':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case '홍보':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case '설문조사':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case '서비스소개':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 mt-4' : ''} p-4 rounded-2xl bg-card-secondary border border-border/30 hover:border-primary/30 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold">{comment.author[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-white">{comment.author}</p>
              <span className="text-xs text-muted-foreground">·</span>
              <p className="text-xs text-muted-foreground">{comment.authorRole}</p>
              <span className="text-xs text-muted-foreground">·</span>
              <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
            </div>
            <p className="text-white/90 leading-relaxed mb-3">{comment.content}</p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3"
              >
                <Heart className="h-3.5 w-3.5 mr-1" />
                좋아요 {comment.likes > 0 && `(${comment.likes})`}
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="h-8 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl px-3"
                >
                  <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                  답글
                </Button>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isReply ? handleDeleteReply(0, comment.id) : handleDeleteComment(comment.id)}
          className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Reply Form */}
      {!isReply && replyingTo === comment.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 ml-12"
        >
          <div className="space-y-3">
            <Textarea
              placeholder="답글을 입력하세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] bg-card border-border/50 rounded-2xl text-white resize-none focus:border-primary"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="rounded-xl text-muted-foreground hover:text-white"
              >
                취소
              </Button>
              <Button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyContent.trim()}
                className="rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold px-6"
              >
                답글 작성
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-white hover:text-primary hover:bg-primary/10 rounded-2xl"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        목록으로 돌아가기
      </Button>

      {/* Main Content */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardHeader className="space-y-6">
          {/* Category and Stats */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`rounded-xl px-3 py-1 font-semibold border ${getCategoryColor(post.category)}`}>
                {post.category}
              </Badge>
              {post.isHot && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/30 rounded-xl px-3 py-1 font-semibold border">
                  🔥 HOT
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{post.author[0]}</span>
              </div>
              <div>
                <p className="text-base font-semibold text-white">{post.author}</p>
                <p className="text-sm text-muted-foreground">{post.authorRole} · {post.timestamp}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4"
              >
                <Heart className="h-5 w-5" />
                <span className="font-medium">{post.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl px-4"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">{post.comments}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.8',
            }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-t border-border/50">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="bg-muted text-white rounded-xl px-4 py-2 text-sm hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">댓글 {comments.length}개</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <div className="space-y-4">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[120px] bg-card-secondary border-border/50 rounded-2xl text-white resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-2xl bg-primary text-white hover:bg-primary/90 font-semibold px-8 glow-effect"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                댓글 작성
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4 pt-6 border-t border-border/50">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">아직 댓글이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">첫 댓글을 작성해보세요!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Posts */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">관련 게시글</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">관련 게시글이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}