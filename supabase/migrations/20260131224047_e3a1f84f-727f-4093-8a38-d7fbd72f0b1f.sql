-- Create event_comments table for community discussions
CREATE TABLE public.event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  user_pick VARCHAR(100),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment_votes table for tracking user votes
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  vote_type VARCHAR(4) CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_comments
-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.event_comments
FOR SELECT
USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments"
ON public.event_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.event_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.event_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for comment_votes
-- Anyone can view votes (for counts)
CREATE POLICY "Anyone can view votes"
ON public.comment_votes
FOR SELECT
USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert their own votes"
ON public.comment_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes"
ON public.comment_votes
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
ON public.comment_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update vote counts on event_comments
CREATE OR REPLACE FUNCTION public.update_comment_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.event_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE public.event_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.event_comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
    ELSE
      UPDATE public.event_comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.event_comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
    ELSE
      UPDATE public.event_comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    IF NEW.vote_type = 'up' THEN
      UPDATE public.event_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE public.event_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for vote count updates
CREATE TRIGGER update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_vote_counts();

-- Create indexes for performance
CREATE INDEX idx_event_comments_prediction_id ON public.event_comments(prediction_id);
CREATE INDEX idx_event_comments_parent_id ON public.event_comments(parent_id);
CREATE INDEX idx_event_comments_user_id ON public.event_comments(user_id);
CREATE INDEX idx_event_comments_created_at ON public.event_comments(created_at DESC);
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_id ON public.comment_votes(user_id);