-- Create blog_articles table for predictions archive
CREATE TABLE public.blog_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sport VARCHAR(100),
    content TEXT,
    summary TEXT,
    prediction_ids UUID[] DEFAULT '{}',
    accuracy_pct NUMERIC,
    total_picks INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    article_date DATE NOT NULL,
    author VARCHAR(100) DEFAULT 'Edge88 AI',
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_blog_articles_date ON public.blog_articles(article_date DESC);
CREATE INDEX idx_blog_articles_sport ON public.blog_articles(sport);
CREATE INDEX idx_blog_articles_published ON public.blog_articles(published);
CREATE INDEX idx_blog_articles_slug ON public.blog_articles(slug);

-- Enable RLS
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
ON public.blog_articles
FOR SELECT
USING (published = true);

-- Admins can manage all articles
CREATE POLICY "Admins can manage articles"
ON public.blog_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_blog_articles_updated_at
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();