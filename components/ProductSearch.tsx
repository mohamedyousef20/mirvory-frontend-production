"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Search, X, Loader2, Clock, TrendingUp, ChevronRight, ArrowUp, ArrowDown, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { productService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductSearchProps {
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  minChars?: number
  immediateSearch?: boolean
  showSuggestions?: boolean
  showRecentSearches?: boolean
  showTrendingSearches?: boolean
}

interface Suggestion {
  type: 'product' | 'category'
  id: string
  title: string
  url: string
}

interface RecentSearch {
  query: string
  searchCount: number
  lastSearchedAt: string
}

interface TrendingSearch {
  query: string
  totalSearches: number
  lastSearchedAt: string
}

const SEARCH_HISTORY_KEY = 'mirvory_search_history'
const MAX_HISTORY_ITEMS = 10
const DEBOUNCE_DELAY = 300

export function ProductSearch({
  onSearch,
  onClear,
  placeholder,
  className,
  autoFocus = false,
  minChars = 2,
  immediateSearch = false,
  showSuggestions = true,
  showRecentSearches = true,
  showTrendingSearches = true,
}: ProductSearchProps) {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [isFetchingRecent, setIsFetchingRecent] = useState(false)
  const [isFetchingTrending, setIsFetchingTrending] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [localHistory, setLocalHistory] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load local search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
        if (saved) {
          setLocalHistory(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // Save to local history
  const saveToLocalHistory = useCallback((query: string) => {
    if (!query.trim()) return
    
    setLocalHistory(prev => {
      const filtered = prev.filter(q => q !== query)
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error('Failed to save search history:', error)
        }
      }
      
      return updated
    })
  }, [])

  // Fetch search suggestions with debouncing
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < minChars || !showSuggestions) {
      setSuggestions([])
      return
    }

    setIsFetchingSuggestions(true)
    try {
      const response = await productService.getSearchSuggestions(query)
      setSuggestions(response.data?.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsFetchingSuggestions(false)
    }
  }, [minChars, showSuggestions])

  // Fetch recent searches
  const fetchRecentSearches = useCallback(async () => {
    if (!user || !showRecentSearches) {
      setRecentSearches([])
      return
    }

    setIsFetchingRecent(true)
    try {
      const response = await productService.getRecentSearches()
      setRecentSearches(response.data?.recentSearches || [])
    } catch (error) {
      console.error('Failed to fetch recent searches:', error)
      setRecentSearches([])
    } finally {
      setIsFetchingRecent(false)
    }
  }, [user, showRecentSearches])

  // Fetch trending searches
  const fetchTrendingSearches = useCallback(async () => {
    if (!showTrendingSearches) {
      setTrendingSearches([])
      return
    }

    setIsFetchingTrending(true)
    try {
      const response = await productService.getTrendingSearches()
      setTrendingSearches(response.data?.trendingSearches || [])
    } catch (error) {
      console.error('Failed to fetch trending searches:', error)
      setTrendingSearches([])
    } finally {
      setIsFetchingTrending(false)
    }
  }, [showTrendingSearches])

  // Debounced search handler
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < minChars) {
      return
    }

    setIsSearching(true)
    try {
      await onSearch(query)
      saveToLocalHistory(query.trim())
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [onSearch, minChars, saveToLocalHistory])

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Fetch suggestions with debounce
    if (showSuggestions) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value)
      }, DEBOUNCE_DELAY)
    }

    // Immediate search if enabled
    if (immediateSearch && value.trim().length >= minChars) {
      handleSearch(value)
    }
  }, [fetchSuggestions, handleSearch, immediateSearch, minChars, showSuggestions])

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchQuery("")
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
    onClear?.()
  }, [onClear])

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim())
      setShowDropdown(false)
    }
  }, [searchQuery, handleSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allItems = [
      ...localHistory,
      ...recentSearches.map(r => r.query),
      ...trendingSearches.map(t => t.query),
      ...suggestions.map(s => s.title)
    ].filter((item, index, arr) => arr.indexOf(item) === index)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          setSearchQuery(allItems[selectedIndex])
          handleSearch(allItems[selectedIndex])
          setShowDropdown(false)
        } else if (searchQuery.trim()) {
          handleSearch(searchQuery.trim())
          setShowDropdown(false)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }, [localHistory, recentSearches, trendingSearches, suggestions, selectedIndex, searchQuery, handleSearch])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setSearchQuery(suggestion.title)
    handleSearch(suggestion.title)
    setShowDropdown(false)
  }, [handleSearch])

  // Handle recent search click
  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQuery(query)
    handleSearch(query)
    setShowDropdown(false)
  }, [handleSearch])

  // Handle trending search click
  const handleTrendingSearchClick = useCallback((query: string) => {
    setSearchQuery(query)
    handleSearch(query)
    setShowDropdown(false)
  }, [handleSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown when input is focused and has content
  useEffect(() => {
    if (searchQuery.trim().length >= minChars) {
      setShowDropdown(true)
      fetchRecentSearches()
      fetchTrendingSearches()
    } else {
      setShowDropdown(false)
    }
  }, [searchQuery, minChars, fetchRecentSearches, fetchTrendingSearches])

  const defaultPlaceholder = language === "ar"
    ? `ابحث عن المنتجات... ${minChars > 1 ? `(حد أدنى ${minChars} حروف)` : ''}`
    : `Search for products... ${minChars > 1 ? `(min ${minChars} chars)` : ''}`

  const showClearButton = searchQuery && !isSearching
  const showLoader = isSearching

  // Combine all dropdown items for keyboard navigation
  const dropdownItems = useMemo(() => {
    const items: Array<{ type: string; content: string; onClick: () => void }> = []

    if (localHistory.length > 0 && !searchQuery) {
      localHistory.forEach(query => {
        items.push({
          type: 'local-history',
          content: query,
          onClick: () => handleRecentSearchClick(query)
        })
      })
    }

    if (recentSearches.length > 0 && !searchQuery) {
      recentSearches.forEach(search => {
        items.push({
          type: 'recent-search',
          content: search.query,
          onClick: () => handleRecentSearchClick(search.query)
        })
      })
    }

    if (trendingSearches.length > 0 && !searchQuery) {
      trendingSearches.forEach(search => {
        items.push({
          type: 'trending-search',
          content: search.query,
          onClick: () => handleTrendingSearchClick(search.query)
        })
      })
    }

    if (suggestions.length > 0) {
      suggestions.forEach(suggestion => {
        items.push({
          type: 'suggestion',
          content: suggestion.title,
          onClick: () => handleSuggestionClick(suggestion)
        })
      })
    }

    return items
  }, [localHistory, recentSearches, trendingSearches, suggestions, searchQuery, handleRecentSearchClick, handleTrendingSearchClick, handleSuggestionClick])

  return (
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="relative"
        role="search"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.trim().length >= minChars) {
                setShowDropdown(true)
                fetchRecentSearches()
                fetchTrendingSearches()
              }
            }}
            placeholder={placeholder || defaultPlaceholder}
            autoFocus={autoFocus}
            className={cn(
              "pl-10 pr-10 rtl:pr-10 rtl:pl-10 transition-all",
              searchQuery && "pr-20 rtl:pl-20"
            )}
            aria-label={language === "ar" ? "شريط البحث" : "Search bar"}
            aria-busy={isSearching}
            autoComplete="off"
          />

          {/* Loading Indicator */}
          {showLoader && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3"
              role="status"
              aria-label={language === "ar" ? "جاري البحث" : "Searching"}
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Clear Button */}
          {showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rtl:right-auto rtl:left-1"
              aria-label={language === "ar" ? "مسح البحث" : "Clear search"}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {showDropdown && dropdownItems.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {/* Local History */}
          {localHistory.length > 0 && !searchQuery && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {language === "ar" ? "السجل المحلي" : "Local History"}
              </div>
              {localHistory.slice(0, 5).map((query, index) => (
                <button
                  key={`local-${index}`}
                  type="button"
                  onClick={() => handleRecentSearchClick(query)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                    selectedIndex === index && "bg-accent"
                  )}
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {query}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {language === "ar" ? "عمليات البحث الأخيرة" : "Recent Searches"}
              </div>
              {isFetchingRecent ? (
                <div className="space-y-2 p-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={`recent-${search._id}`}
                    type="button"
                    onClick={() => handleRecentSearchClick(search.query)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                      selectedIndex === localHistory.length + index && "bg-accent"
                    )}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {search.query}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Trending Searches */}
          {trendingSearches.length > 0 && !searchQuery && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {language === "ar" ? "عمليات البحث الرائجة" : "Trending Searches"}
              </div>
              {isFetchingTrending ? (
                <div className="space-y-2 p-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                trendingSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={`trending-${index}`}
                    type="button"
                    onClick={() => handleTrendingSearchClick(search.query)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                      selectedIndex === localHistory.length + recentSearches.length + index && "bg-accent"
                    )}
                  >
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    {search.query}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <Search className="h-3 w-3" />
                {language === "ar" ? "اقتراحات" : "Suggestions"}
              </div>
              {isFetchingSuggestions ? (
                <div className="space-y-2 p-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center justify-between gap-2",
                      selectedIndex === localHistory.length + recentSearches.length + trendingSearches.length + index && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'category' && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      {suggestion.title}
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* No results */}
          {!isFetchingSuggestions && !isFetchingRecent && !isFetchingTrending && dropdownItems.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {language === "ar" ? "لا توجد نتائج" : "No results"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}