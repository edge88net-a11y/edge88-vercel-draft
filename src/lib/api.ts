/**
 * Edge88 Backend API Client
 * Single source of truth for ALL backend API calls
 * 
 * Backend URL: https://api.edge88.net (production) or http://localhost:8000 (development)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.edge88.net/api/v1';

interface ApiResponse<T> {
  status: string;
  data?: T;
  error?: string;
  message?: string;
}

class Edge88API {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      
      // Handle both direct data and wrapped responses
      if (json.data !== undefined) {
        return json.data as T;
      }
      
      return json as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================================================
  // STATS & DASHBOARD
  // ============================================================================

  /**
   * Get overall system stats
   * Used on: Dashboard, home page
   */
  async getStats() {
    return this.fetch<{
      total_predictions: number;
      wins: number;
      losses: number;
      pending: number;
      accuracy_percentage: number;
      profit_today_kc: number;
      roi_today: number;
      profit_week_kc: number;
      roi_week: number;
      profit_month_kc: number;
      roi_month: number;
      active_predictions: number;
      predictions_today: number;
      win_streak: number;
    }>('/predictions/stats');
  }

  /**
   * Get daily performance metrics
   * Used on: Analytics page, dashboard charts
   */
  async getDailyPerformance(days: number = 30) {
    return this.fetch<Array<{
      date: string;
      total_predictions: number;
      wins: number;
      losses: number;
      pending: number;
      accuracy: number;
      profit_kc: number;
      roi_percentage: number;
      best_sport: string;
      worst_sport: string;
      avg_confidence: number;
      avg_odds: number;
      avg_ev_percentage: number;
      total_staked: number;
    }>>(`/analytics/daily?days=${days}`);
  }

  /**
   * Get sport performance breakdown
   * Used on: Dashboard, analytics
   */
  async getSportPerformance() {
    return this.fetch<Array<{
      sport: string;
      period: string;
      wins: number;
      losses: number;
      pending: number;
      accuracy: number;
      profit_kc: number;
      roi_percentage: number;
      avg_confidence: number;
      avg_odds: number;
      avg_ev_percentage: number;
      total_staked: number;
    }>>('/analytics/by-sport');
  }

  /**
   * Get engine health metrics
   * Used on: Admin panel, system status
   */
  async getEngineHealth() {
    return this.fetch<{
      total_predictions: number;
      active_predictions: number;
      graded_predictions: number;
      accuracy_7d: number;
      accuracy_30d: number;
      accuracy_alltime: number;
      profit_alltime_kc: number;
      roi_alltime: number;
      last_prediction: string;
      last_updated: string;
    }>('/analytics/engine-health');
  }

  // ============================================================================
  // PREDICTIONS
  // ============================================================================

  /**
   * Get active predictions (today's picks)
   * Used on: Dashboard, predictions page
   */
  async getActivePredictions() {
    return this.fetch<any[]>('/predictions/active');
  }

  /**
   * Get single prediction by ID
   * Used on: Prediction detail page
   */
  async getPredictionById(id: string) {
    return this.fetch<any>(`/predictions/${id}`);
  }

  /**
   * Get high-value predictions (positive EV)
   * Used on: Value bets section
   */
  async getHighValuePicks(minEv: number = 5) {
    return this.fetch<any[]>(`/analytics/high-value?min_ev=${minEv}`);
  }

  /**
   * Get prediction results (completed games)
   * Used on: Results page, history
   */
  async getResults(params?: {
    sport?: string;
    days?: number;
    limit?: number;
    status?: 'won' | 'lost';
  }) {
    const query = new URLSearchParams();
    if (params?.sport) query.set('sport', params.sport);
    if (params?.days) query.set('days', String(params.days));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) {
      // Map status to backend filter
      query.set('is_correct', params.status === 'won' ? 'true' : 'false');
    }
    
    const endpoint = `/predictions/results${query.toString() ? '?' + query.toString() : ''}`;
    return this.fetch<any[]>(endpoint);
  }

  /**
   * Get mystical analysis for a prediction
   * Used on: Prediction detail (Elite tier)
   */
  async getMysticalAnalysis(id: string) {
    return this.fetch<any>(`/predictions/${id}/mystical`);
  }

  /**
   * Get odds comparison for a prediction
   * Used on: Prediction detail, odds tracking
   */
  async getOddsComparison(id: string) {
    return this.fetch<any>(`/predictions/${id}/odds`);
  }

  /**
   * Get odds movement for a prediction
   * Used on: Prediction detail, line tracking
   */
  async getOddsMovement(id: string) {
    return this.fetch<any>(`/analytics/predictions/${id}/odds-movement`);
  }

  // ============================================================================
  // USER & BETTING SLIPS
  // ============================================================================

  /**
   * Get user stats (requires auth)
   * Used on: Dashboard, profile
   */
  async getUserStats(userId: string) {
    return this.fetch<any>(`/user/${userId}/stats`);
  }

  /**
   * Add prediction to betting slip
   * Used on: Prediction cards, detail page
   */
  async addToBettingSlip(userId: string, predictionId: string) {
    return this.fetch<any>('/betting-slip/add', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, prediction_id: predictionId }),
    });
  }

  /**
   * Remove prediction from betting slip
   * Used on: Betting slip management
   */
  async removeFromBettingSlip(userId: string, predictionId: string) {
    return this.fetch<any>('/betting-slip/remove', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, prediction_id: predictionId }),
    });
  }

  /**
   * Get user's betting slip
   * Used on: Betting slip page
   */
  async getBettingSlip(userId: string) {
    return this.fetch<any>(`/betting-slip/${userId}`);
  }

  // ============================================================================
  // COMMUNITY & VOTES
  // ============================================================================

  /**
   * Vote on a prediction
   * Used on: Prediction cards (agree/disagree buttons)
   */
  async votePrediction(userId: string, predictionId: string, vote: 'agree' | 'disagree') {
    return this.fetch<any>('/community/vote', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, prediction_id: predictionId, vote }),
    });
  }

  /**
   * Get votes for a prediction
   * Used on: Prediction detail (community sentiment)
   */
  async getVotes(predictionId: string) {
    return this.fetch<{
      agree: number;
      disagree: number;
      user_vote?: 'agree' | 'disagree';
    }>(`/community/votes/${predictionId}`);
  }

  // ============================================================================
  // ADMIN & AUTOMATION (requires admin role)
  // ============================================================================

  /**
   * Trigger prediction engine manually
   * Used on: Admin panel
   */
  async runPredictionEngine() {
    return this.fetch<any>('/automation/run-prediction-engine', {
      method: 'POST',
    });
  }

  /**
   * Trigger result checker manually
   * Used on: Admin panel
   */
  async checkResults() {
    return this.fetch<any>('/automation/check-results', {
      method: 'POST',
    });
  }

  /**
   * Run data quality checks
   * Used on: Admin panel
   */
  async runDataQuality() {
    return this.fetch<any>('/automation/data-quality', {
      method: 'POST',
    });
  }

  /**
   * Get engine metrics (monitoring data)
   * Used on: Admin panel, system health
   */
  async getEngineMetrics(metricName?: string, hours: number = 24) {
    const query = new URLSearchParams();
    if (metricName) query.set('metric_name', metricName);
    query.set('hours', String(hours));
    
    return this.fetch<any[]>(`/analytics/metrics?${query.toString()}`);
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check API health
   * Used on: App initialization, error boundaries
   */
  async healthCheck() {
    return this.fetch<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const api = new Edge88API();

// Export types for consumers
export type { ApiResponse };
