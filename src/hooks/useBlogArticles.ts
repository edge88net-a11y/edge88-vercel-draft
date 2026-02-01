import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  sport: string | null;
  content: string | null;
  summary: string | null;
  prediction_ids: string[];
  accuracy_pct: number | null;
  total_picks: number;
  wins: number;
  losses: number;
  article_date: string;
  author: string;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

interface UseBlogArticlesOptions {
  sport?: string;
  limit?: number;
  featured?: boolean;
  sortBy?: 'date' | 'accuracy';
}

export function useBlogArticles(options: UseBlogArticlesOptions = {}) {
  const { sport, limit = 20, featured, sortBy = 'date' } = options;

  return useQuery({
    queryKey: ['blog-articles', sport, limit, featured, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('blog_articles')
        .select('*')
        .eq('published', true);

      if (sport && sport !== 'all') {
        query = query.eq('sport', sport);
      }

      if (featured) {
        query = query.eq('featured', true);
      }

      if (sortBy === 'accuracy') {
        query = query.order('accuracy_pct', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('article_date', { ascending: false });
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching blog articles:', error);
        throw error;
      }

      return (data || []) as BlogArticle[];
    },
  });
}

export function useBlogArticle(slugOrId: string) {
  return useQuery({
    queryKey: ['blog-article', slugOrId],
    queryFn: async () => {
      // Try to fetch by slug first, then by id
      let { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slugOrId)
        .eq('published', true)
        .maybeSingle();

      if (!data && !error) {
        // Try by ID
        const result = await supabase
          .from('blog_articles')
          .select('*')
          .eq('id', slugOrId)
          .eq('published', true)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching blog article:', error);
        throw error;
      }

      // Increment view count
      if (data) {
        supabase
          .from('blog_articles')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id)
          .then(() => {});
      }

      return data as BlogArticle | null;
    },
    enabled: !!slugOrId,
  });
}

export function useBlogStats() {
  return useQuery({
    queryKey: ['blog-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('accuracy_pct, total_picks, wins')
        .eq('published', true);

      if (error) {
        console.error('Error fetching blog stats:', error);
        throw error;
      }

      const articles = data || [];
      const totalArticles = articles.length;
      const totalPicks = articles.reduce((sum, a) => sum + (a.total_picks || 0), 0);
      const totalWins = articles.reduce((sum, a) => sum + (a.wins || 0), 0);
      const avgAccuracy = articles.length > 0
        ? articles.reduce((sum, a) => sum + (a.accuracy_pct || 0), 0) / articles.length
        : 0;

      return {
        totalArticles,
        totalPicks,
        totalWins,
        avgAccuracy,
      };
    },
  });
}
