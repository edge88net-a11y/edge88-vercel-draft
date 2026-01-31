import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Comment {
  id: string;
  prediction_id: string;
  user_id: string;
  parent_id: string | null;
  comment_text: string;
  user_pick: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  // Joined fields
  user_display_name?: string;
  user_avatar_url?: string;
  user_subscription_tier?: string;
  user_vote?: 'up' | 'down' | null;
  replies?: Comment[];
}

export interface CreateCommentData {
  prediction_id: string;
  comment_text: string;
  user_pick?: string | null;
  parent_id?: string | null;
}

export function useComments(predictionId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', predictionId],
    queryFn: async () => {
      // Fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from('event_comments')
        .select('*')
        .eq('prediction_id', predictionId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch user profiles for display names
      const userIds = [...new Set(comments?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, subscription_tier')
        .in('user_id', userIds);

      // Fetch user's votes if logged in
      let userVotes: Record<string, 'up' | 'down'> = {};
      if (user) {
        const { data: votes } = await supabase
          .from('comment_votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .in('comment_id', comments?.map(c => c.id) || []);

        votes?.forEach(v => {
          userVotes[v.comment_id] = v.vote_type as 'up' | 'down';
        });
      }

      // Map profiles to comments
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enrichedComments: Comment[] = (comments || []).map(comment => ({
        ...comment,
        user_display_name: profileMap.get(comment.user_id)?.display_name || 'Anonymous',
        user_avatar_url: profileMap.get(comment.user_id)?.avatar_url || null,
        user_subscription_tier: profileMap.get(comment.user_id)?.subscription_tier || 'free',
        user_vote: userVotes[comment.id] || null,
      }));

      // Organize into threads (parent/child)
      const topLevel = enrichedComments.filter(c => !c.parent_id);
      const replies = enrichedComments.filter(c => c.parent_id);

      topLevel.forEach(comment => {
        comment.replies = replies.filter(r => r.parent_id === comment.id);
      });

      return topLevel;
    },
    enabled: !!predictionId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: comment, error } = await supabase
        .from('event_comments')
        .insert({
          prediction_id: data.prediction_id,
          user_id: user.id,
          comment_text: data.comment_text,
          user_pick: data.user_pick || null,
          parent_id: data.parent_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', predictionId] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ commentId, voteType }: { commentId: string; voteType: 'up' | 'down' }) => {
      if (!user) throw new Error('Must be logged in');

      // Check existing vote
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          const { error } = await supabase
            .from('comment_votes')
            .delete()
            .eq('id', existingVote.id);
          if (error) throw error;
        } else {
          // Change vote
          const { error } = await supabase
            .from('comment_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          if (error) throw error;
        }
      } else {
        // Create vote
        const { error } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', predictionId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', predictionId] });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    error: commentsQuery.error,
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeleting: deleteCommentMutation.isPending,
  };
}

// Calculate community sentiment
export function useCommunitySentiment(comments: Comment[]) {
  const teamVotes: Record<string, number> = {};

  comments.forEach(comment => {
    if (comment.user_pick) {
      teamVotes[comment.user_pick] = (teamVotes[comment.user_pick] || 0) + 1;
    }
    comment.replies?.forEach(reply => {
      if (reply.user_pick) {
        teamVotes[reply.user_pick] = (teamVotes[reply.user_pick] || 0) + 1;
      }
    });
  });

  const totalVotes = Object.values(teamVotes).reduce((a, b) => a + b, 0);

  return { teamVotes, totalVotes };
}
