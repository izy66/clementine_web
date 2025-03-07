// Create a constants file for all chart-related constants
export const COLORS = ['#4f46e5', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];
export const MONTHLY_BUDGET_AMOUNT = 1000;
export const MONTHLY_CHART_MAX_Y = 3500;
export const LARGE_GIFT_THRESHOLD = 4000;
export const PIE_CHART_INNER_RADIUS = 60;
export const PIE_CHART_OUTER_RADIUS = 120;
export const PIE_CHART_PADDING_ANGLE = 2;
export const PIE_CHART_CX_PERCENT = "35%";
export const PIE_CHART_CY_PERCENT = "50%";
export const TOP_CATEGORIES_COUNT = 6;
// Used for consistent chart heights across components
export const CHART_HEIGHT = 400;
export const YEAR_SUMMARY_COLUMNS = ['Year', 'Income', 'Expenses', 'Net'];
export const MAX_BAR_WIDTH_PERCENT = 90;
export const INCOME_BAR_COLOR = "rgba(34, 197, 94, 0.15)";
export const EXPENSE_BAR_COLOR = "rgba(239, 68, 68, 0.15)";
export const NET_POSITIVE_COLOR = "rgba(34, 197, 94, 0.15)";
export const NET_NEGATIVE_COLOR = "rgba(239, 68, 68, 0.15)";

// Common excluded categories
export const EXCLUDED_CATEGORIES_LIST = ['Credit Card Payment', 'Transfers', 'Tuition', 'Gifts'];
export const PIE_CHART_EXCLUDED_LIST = ['Income', ...EXCLUDED_CATEGORIES_LIST]; 