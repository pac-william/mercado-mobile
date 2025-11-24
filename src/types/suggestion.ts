export interface SuggestionItem {
  name: string;
  categoryId: string;
  categoryName: string;
  type: "essential" | "common" | "utensil";
}

export interface Receipt {
  name: string;
  description: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime?: number;
  servings: number;
}

export interface SuggestionData {
  items: SuggestionItem[];
  receipt?: Receipt;
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

