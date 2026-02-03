import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';

interface SearchSuggestion {
  type: 'team' | 'sport' | 'recent';
  text: string;
  icon?: React.ReactNode;
}

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  className?: string;
}

export function EnhancedSearchBar({
  value,
  onChange,
  placeholder,
  suggestions = [],
  recentSearches = [],
  onClearRecent,
  className
}: EnhancedSearchBarProps) {
  const { language } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (text: string) => {
    onChange(text);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.text.toLowerCase().includes(value.toLowerCase())
  );

  const showDropdown = showSuggestions && (value.length > 0 ? filteredSuggestions.length > 0 : recentSearches.length > 0);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className={cn(
        'relative flex items-center',
        'border border-border rounded-lg',
        'bg-background transition-all duration-200',
        isFocused && 'border-primary ring-2 ring-primary/20'
      )}>
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || (language === 'cz' ? 'Hledat tým, sport...' : 'Search team, sport...')}
          className={cn(
            'pl-10 pr-10 border-0 focus-visible:ring-0',
            'bg-transparent'
          )}
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-2 z-50',
          'bg-card border border-border rounded-lg shadow-2xl',
          'max-h-80 overflow-y-auto',
          'animate-in slide-in-from-top-2 duration-200'
        )}>
          {/* Search Results */}
          {value && filteredSuggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                {language === 'cz' ? 'Výsledky' : 'Results'}
              </div>
              {filteredSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2',
                    'hover:bg-muted transition-colors text-left',
                    'border-b border-border last:border-0'
                  )}
                >
                  {suggestion.icon || (
                    suggestion.type === 'team' ? (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )
                  )}
                  <span className="text-sm">{suggestion.text}</span>
                  {suggestion.type === 'sport' && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {language === 'cz' ? 'Sport' : 'Sport'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!value && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'cz' ? 'Nedávné hledání' : 'Recent searches'}
                </span>
                {onClearRecent && (
                  <button
                    onClick={onClearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {language === 'cz' ? 'Vymazat' : 'Clear'}
                  </button>
                )}
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(search)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2',
                    'hover:bg-muted transition-colors text-left',
                    'border-b border-border last:border-0'
                  )}
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
