import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { motion } from 'motion/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/styles/react-quill-dark.css';
import { EventPost } from './EventBoard';

interface CreateEventPostProps {
  onBack: () => void;
  onSubmit: (post: Omit<EventPost, 'id' | 'author' | 'authorRole' | 'timestamp' | 'views' | 'likes' | 'comments' | 'isHot'>) => void;
}

export function CreateEventPost({ onBack, onSubmit }: CreateEventPostProps) {
  const [newPost, setNewPost] = useState({
    category: '행사' as EventPost['category'],
    title: '',
    content: '',
    tags: '',
  });

  const handleSubmit = () => {
    const post = {
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
    };

    onSubmit(post);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="rounded-2xl hover:bg-card-secondary text-white -ml-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          뒤로가기
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">새 게시글 작성</h2>
          <p className="text-muted-foreground text-base md:text-lg mt-1">
            커뮤니티와 공유하고 싶은 내용을 자유롭게 작성해주세요
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!newPost.title || !newPost.content}
          className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold glow-effect h-12"
        >
          <Save className="mr-2 h-5 w-5" />
          게시하기
        </Button>
      </div>

      {/* Form */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardContent className="pt-8 space-y-6">
          {/* Category */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-white font-semibold text-lg">
              카테고리
            </Label>
            <Select
              value={newPost.category}
              onValueChange={(value: EventPost['category']) =>
                setNewPost({ ...newPost, category: value })
              }
            >
              <SelectTrigger
                id="category"
                className="h-14 bg-card-secondary border-border/50 rounded-2xl text-white text-base"
              >
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-2xl">
                <SelectItem value="행사" className="text-base">🎉 행사</SelectItem>
                <SelectItem value="홍보" className="text-base">📢 홍보</SelectItem>
                <SelectItem value="설문조사" className="text-base">📊 설문조사</SelectItem>
                <SelectItem value="서비스소개" className="text-base">💡 서비스소개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-white font-semibold text-lg">
              제목
            </Label>
            <Input
              id="title"
              placeholder="눈에 띄는 제목을 입력하세요"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="h-14 bg-card-secondary border-border/50 rounded-2xl text-white text-base placeholder:text-muted-foreground"
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Label htmlFor="content" className="text-white font-semibold text-lg">
              내용
            </Label>
            <div className="ckeditor-dark-theme">
              <ReactQuill
                theme="snow"
                value={newPost.content}
                onChange={(value) => setNewPost({ ...newPost, content: value })}
                placeholder="상세한 내용을 작성해주세요..."
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['clean'],
                    ['link', 'image']
                  ]
                }}
                formats={[
                  'header', 'size',
                  'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
                  'list', 'bullet', 'indent',
                  'link', 'image',
                  'color', 'background',
                  'align'
                ]}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-white font-semibold text-lg">
              태그 <span className="text-muted-foreground font-normal text-sm">(쉼표로 구분)</span>
            </Label>
            <Input
              id="tags"
              placeholder="네트워킹, 스타트업, AI, 투자유치"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              className="h-14 bg-card-secondary border-border/50 rounded-2xl text-white text-base placeholder:text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              태그를 추가하면 다른 사용자들이 게시글을 더 쉽게 찾을 수 있습니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Action Bar */}
      <Card className="bg-card border-border/50 rounded-3xl sticky bottom-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-white">Tip:</span> 명확하고 구체적인 내용을 작성하면 더 많은 관심을 받을 수 있습니다
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="rounded-2xl border-border/50 text-white hover:bg-card-secondary"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newPost.title || !newPost.content}
                className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold glow-effect"
              >
                <Save className="mr-2 h-5 w-5" />
                게시하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}