export interface SuggestionItem {
  name: string;
  categoryId: string;
  categoryName: string;
  type: "essential" | "common" | "utensil";
}

export interface SuggestionData {
  items: SuggestionItem[];
}

export interface Suggestion {
  id: string;
  userId: string;
  task: string;
  data: SuggestionData;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionListItem {
  id: string;
}

export interface SuggestionPaginatedResponse {
  suggestions: SuggestionListItem[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    totalItems: number;
  };
}

