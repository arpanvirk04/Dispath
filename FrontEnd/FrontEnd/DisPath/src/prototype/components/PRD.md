1. Customers Tab
Features:

Display existing customer list in cards/table format
"Add Customer" button with input fields:

Name (required)
Email
Phone
Address


Click on customer → Navigate to Customer Profile tab

2. Customer Profile Tab
Display Data:

Customer basic info (name, email, phone, address)
Mock cases list with status
Service history with dates and durations

Actions:

"Create Order" button → Opens order creation form with fields:

Service type/description
Service time (minutes/hours)
Priority level
Notes


Orders get added to orders array and appear in Order Management tab

3. Order Management Tab
Display:

List all orders from all customers
Show: Customer name, service, service time, status, created date

Features:

"Route" column with dropdown to assign orders to existing routes
When assigned, order gets linked to selected route
Route dropdown populated from routes array

4. Routes Tab
Remove all existing mock data
Create Route Features:

"Create Route" button with input fields:

Route name (required)
Date (required)
Completion time (auto-calculated from assigned orders)
Kilometers (mock data for now)



Auto-Population Logic:

Completion time = sum of all assigned order service times
Assigned orders count updates when orders are assigned from Order Management

Filtering:

Date filter dropdown/input to filter routes by date

Data Flow

Customer Creation → Customers array
Order Creation → Orders array (linked to customer ID)
Route Creation → Routes array
Order Assignment → Updates order with route ID, updates route completion time

Technical Requirements

Use React state management (useState)
No localStorage (use in-memory arrays)
Responsive design with modern UI
Form validation for required fields
Real-time updates between components