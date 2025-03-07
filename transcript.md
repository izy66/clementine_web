Finance Tracker Architecture & Design Guidelines
Project Overview
This is a personal finance tracking application built with React and TypeScript. It allows users to track expenses and income, visualize spending patterns, and manage transaction history. The app uses client-side storage (localStorage) to persist data.
Core Features
Transaction management (add, edit, delete)
CSV data import/export
Spending visualization (pie charts, line charts)
Transaction filtering and sorting
Special category handling (Education, Gifts)
Architecture
Data Model
}
Storage
Uses LocalStorage for data persistence
Transactions stored as JSON
No chunking needed (moved from cookie-based storage)
Component Structure
App: Main container, manages state and routing
Sidebar: Navigation between panels
TransactionList: Displays and filters transaction history
TransactionCharts: Visualizes spending patterns
TransactionChat: AI assistant interface (placeholder)
DataImport: Handles CSV import
TransactionItem: Individual transaction display
TransactionForm: Add/edit transaction form
Data Flow
User imports CSV or adds transactions manually
Transactions processed and stored in localStorage
App retrieves transactions on load
Components receive transactions as props
UI updates based on filtered/processed data
Business Logic
Transaction Processing
AMEX transactions:
Positive amounts → expenses
Negative amounts → refunds
Matched expense-refund pairs are excluded from visualizations
WS (Wise) transactions:
"Income" category with positive amounts → income
Other categories with positive amounts → refunds
Negative amounts → expenses
Special Categories
"Education" expenses tracked separately
"Credit Card Payment" excluded from calculations
"Transfer In/Out" excluded from calculations
Large gifts (≥$5000) tracked separately
Design Patterns
Functional components with hooks
Memoization for expensive calculations
Centralized state management in App component
Prop drilling for data passing
Async/await for storage operations
UI/UX Guidelines
Clean, minimalist design with white cards on light gray background
Responsive layouts with Tailwind CSS
Animated transitions with Framer Motion
Consistent color scheme for charts
Emoji icons for categories
Tooltips for additional information
Current Limitations
No backend integration (local storage only)
No user authentication
Limited to single user
No recurring transaction support
No budgeting features
Future Enhancements
Backend integration with proper database
Multi-user support with authentication
Budget planning and tracking
Recurring transaction support
Advanced analytics and forecasting
Mobile app version
Implementation Notes
Transaction matching logic identifies expense-refund pairs
Category filtering implemented at visualization level
Special category summary displayed separately
Monthly trend excludes certain categories
Transaction list supports filtering and sorting
