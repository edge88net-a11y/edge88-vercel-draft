import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Send, 
  Loader2, 
  Crown, 
  Star, 
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComments, useCommunitySentiment, Comment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { isAdminUser } from '@/lib/adminAccess';

interface DiscussionTabProps {
  predictionId: string;
  homeTeam: string;
  awayTeam: string;
}

type SortOption = 'recent' | 'upvoted' | 'discussed';

export function DiscussionTab({ predictionId, homeTeam, awayTeam }: DiscussionTabProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { comments, isLoading, createComment, isCreating, vote, isVoting, deleteComment } = useComments(predictionId);
  const { teamVotes, totalVotes } = useCommunitySentiment(comments);
  
  const [commentText, setCommentText] = useState('');
  const [selectedPick, setSelectedPick] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const t = {
    discussion: language === 'cz' ? 'Diskuze' : 'Discussion',
    sharePlaceholder: language === 'cz' ? 'Sdílej svou analýzu...' : 'Share your analysis...',
    replyPlaceholder: language === 'cz' ? 'Napište odpověď...' : 'Write a reply...',
    send: language === 'cz' ? 'Odeslat' : 'Send',
    reply: language === 'cz' ? 'Odpovědět' : 'Reply',
    loginPrompt: language === 'cz' ? 'Přihlaste se pro diskuzi' : 'Login to join discussion',
    sortRecent: language === 'cz' ? 'Nejnovější' : 'Most Recent',
    sortUpvoted: language === 'cz' ? 'Nejlépe hodnocené' : 'Most Upvoted',
    sortDiscussed: language === 'cz' ? 'Nejvíce diskutované' : 'Most Discussed',
    imTaking: language === 'cz' ? 'Vsázím na' : "I'm taking",
    topAnalysis: language === 'cz' ? 'Top Analýza' : 'Top Analysis',
    communitySentiment: language === 'cz' ? 'Názor komunity' : 'Community Sentiment',
    picking: language === 'cz' ? 'vsází na' : 'picking',
    noComments: language === 'cz' ? 'Zatím žádné komentáře' : 'No comments yet',
    beFirst: language === 'cz' ? 'Buďte první, kdo sdílí svou analýzu!' : 'Be the first to share your analysis!',
    showReplies: language === 'cz' ? 'Zobrazit odpovědi' : 'Show replies',
    hideReplies: language === 'cz' ? 'Skrýt odpovědi' : 'Hide replies',
  };

  // Sort comments
  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'upvoted':
        sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'discussed':
        sorted.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [comments, sortBy]);

  // Find top comment
  const topComment = useMemo(() => {
    if (comments.length === 0) return null;
    return comments.reduce((best, curr) => {
      const bestScore = best.upvotes - best.downvotes;
      const currScore = curr.upvotes - curr.downvotes;
      return currScore > bestScore ? curr : best;
    });
  }, [comments]);

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    createComment({
      prediction_id: predictionId,
      comment_text: commentText,
      user_pick: selectedPick,
    });
    setCommentText('');
    setSelectedPick(null);
  };

  const handleReply = (parentId: string) => {
    if (!replyText.trim()) return;
    createComment({
      prediction_id: predictionId,
      comment_text: replyText,
      parent_id: parentId,
    });
    setReplyText('');
    setReplyTo(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // Helper to check if a user email is admin (for display purposes)
  const renderAdminBadge = (userEmail?: string) => {
    if (isAdminUser(userEmail)) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] px-1.5 py-0 shadow-[0_0_10px_hsl(45,100%,50%,0.3)]">
          <Crown className="h-2.5 w-2.5 mr-0.5" />
          👑 ADMIN
        </Badge>
      );
    }
    return null;
  };

  const getTierBadge = (tier: string, userEmail?: string) => {
    // Admin badge takes priority
    if (isAdminUser(userEmail)) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] px-1.5 py-0 shadow-[0_0_10px_hsl(45,100%,50%,0.3)]">
          <Crown className="h-2.5 w-2.5 mr-0.5" />
          👑 ADMIN
        </Badge>
      );
    }
    
    switch (tier?.toLowerCase()) {
      case 'pro':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] px-1.5 py-0">
            <Crown className="h-2.5 w-2.5 mr-0.5" />
            PRO
          </Badge>
        );
      case 'elite':
        return (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] px-1.5 py-0">
            <Star className="h-2.5 w-2.5 mr-0.5" />
            ELITE
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Sentiment Bar */}
      {totalVotes > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t.communitySentiment}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              {Object.entries(teamVotes).map(([team, votes]) => {
                const percentage = Math.round((votes / totalVotes) * 100);
                const isHome = team === homeTeam;
                return (
                  <span key={team} className={cn(
                    'font-medium',
                    isHome ? 'text-primary' : 'text-accent'
                  )}>
                    {percentage}% {t.picking} {team}
                  </span>
                );
              })}
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              {Object.entries(teamVotes).map(([team, votes]) => {
                const percentage = (votes / totalVotes) * 100;
                const isHome = team === homeTeam;
                return (
                  <div
                    key={team}
                    className={cn(
                      'h-full transition-all',
                      isHome ? 'bg-primary' : 'bg-accent'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Comment Input */}
      <div className="glass-card p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          {t.discussion}
        </h3>

        {user ? (
          <div className="space-y-4">
            <Textarea
              placeholder={t.sharePlaceholder}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px] resize-none bg-muted/50 border-border focus:border-primary"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Team Pick Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t.imTaking}:</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedPick === homeTeam ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPick(selectedPick === homeTeam ? null : homeTeam)}
                    className={cn(
                      selectedPick === homeTeam && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {homeTeam}
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPick === awayTeam ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPick(selectedPick === awayTeam ? null : awayTeam)}
                    className={cn(
                      selectedPick === awayTeam && 'bg-accent text-accent-foreground'
                    )}
                  >
                    {awayTeam}
                  </Button>
                </div>
              </div>

              <div className="flex-1" />

              <Button 
                onClick={handleSubmit} 
                disabled={!commentText.trim() || isCreating}
                className="gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t.send}
              </Button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="block">
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t.loginPrompt}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Sort Options */}
      {comments.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {comments.length} {language === 'cz' ? 'komentářů' : 'comments'}
          </p>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t.sortRecent}</SelectItem>
              <SelectItem value="upvoted">{t.sortUpvoted}</SelectItem>
              <SelectItem value="discussed">{t.sortDiscussed}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h4 className="font-medium mb-2">{t.noComments}</h4>
          <p className="text-sm text-muted-foreground">{t.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isTopComment={topComment?.id === comment.id && (comment.upvotes - comment.downvotes) > 0}
              currentUserId={user?.id}
              onVote={(voteType) => vote({ commentId: comment.id, voteType })}
              onDelete={() => deleteComment(comment.id)}
              onReply={() => setReplyTo(comment.id)}
              replyTo={replyTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReply={() => handleReply(comment.id)}
              isCreating={isCreating}
              expandedReplies={expandedReplies}
              toggleReplies={toggleReplies}
              getTierBadge={getTierBadge}
              t={t}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  isTopComment: boolean;
  currentUserId?: string;
  onVote: (voteType: 'up' | 'down') => void;
  onDelete: () => void;
  onReply: () => void;
  replyTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReply: () => void;
  isCreating: boolean;
  expandedReplies: Set<string>;
  toggleReplies: (id: string) => void;
  getTierBadge: (tier: string) => React.ReactNode;
  t: Record<string, string>;
  homeTeam: string;
  awayTeam: string;
}

function CommentCard({
  comment,
  isTopComment,
  currentUserId,
  onVote,
  onDelete,
  onReply,
  replyTo,
  replyText,
  setReplyText,
  handleReply,
  isCreating,
  expandedReplies,
  toggleReplies,
  getTierBadge,
  t,
  homeTeam,
  awayTeam,
}: CommentCardProps) {
  const isOwner = currentUserId === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const repliesExpanded = expandedReplies.has(comment.id);
  const score = comment.upvotes - comment.downvotes;

  return (
    <div className={cn(
      'glass-card p-5 backdrop-blur-xl transition-all',
      isTopComment && 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-500/5 to-transparent'
    )}>
      {/* Top Analysis Badge */}
      {isTopComment && (
        <div className="flex items-center gap-2 mb-3 text-yellow-400">
          <Trophy className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">{t.topAnalysis}</span>
        </div>
      )}

      {/* Comment Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border-2 border-muted">
          <AvatarImage src={comment.user_avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {comment.user_display_name?.charAt(0).toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{comment.user_display_name}</span>
            {getTierBadge(comment.user_subscription_tier || 'free')}
            {comment.user_pick && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-[10px]',
                  comment.user_pick === homeTeam 
                    ? 'border-primary text-primary' 
                    : 'border-accent text-accent'
                )}
              >
                {t.imTaking} {comment.user_pick}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Comment Text */}
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.comment_text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onVote('up')}
              disabled={!currentUserId}
              className={cn(
                'flex items-center gap-1 text-sm transition-colors',
                comment.user_vote === 'up' 
                  ? 'text-success' 
                  : 'text-muted-foreground hover:text-success',
                !currentUserId && 'cursor-not-allowed opacity-50'
              )}
            >
              <ThumbsUp className={cn('h-4 w-4', comment.user_vote === 'up' && 'fill-current')} />
              {comment.upvotes}
            </button>

            <button
              onClick={() => onVote('down')}
              disabled={!currentUserId}
              className={cn(
                'flex items-center gap-1 text-sm transition-colors',
                comment.user_vote === 'down' 
                  ? 'text-destructive' 
                  : 'text-muted-foreground hover:text-destructive',
                !currentUserId && 'cursor-not-allowed opacity-50'
              )}
            >
              <ThumbsDown className={cn('h-4 w-4', comment.user_vote === 'down' && 'fill-current')} />
              {comment.downvotes}
            </button>

            {currentUserId && (
              <button
                onClick={onReply}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-4 w-4" />
                {t.reply}
              </button>
            )}

            {isOwner && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyTo === comment.id && currentUserId && (
            <div className="mt-4 flex gap-2">
              <Textarea
                placeholder={t.replyPlaceholder}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] resize-none text-sm bg-muted/50"
              />
              <Button 
                size="sm" 
                onClick={handleReply}
                disabled={!replyText.trim() || isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
            >
              {repliesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {repliesExpanded ? t.hideReplies : t.showReplies} ({comment.replies?.length})
            </button>
          )}

          {/* Replies List */}
          {repliesExpanded && comment.replies && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.user_avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {reply.user_display_name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.user_display_name}</span>
                        {getTierBadge(reply.user_subscription_tier || 'free')}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.comment_text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
