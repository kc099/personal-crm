# Personal CRM

A modern, full-stack Customer Relationship Management application designed for tracking customers, projects, milestones, and activities. Built with React, Express.js, and PostgreSQL.

## 🚀 Features

### 👥 Customer Management
- Add, edit, and delete customers
- Track contact information (name, email, phone, company, address)
- Add notes and relationship details
- Search and filter customers
- Unique email validation

### 📊 Project Management
- Create and manage projects
- Assign projects to customers
- Track project status (active, completed, on-hold, cancelled)
- Add project descriptions and GitHub repository links
- Manage tech stack for each project
- Set start and end dates

### 🎯 Milestone Tracking
- Add milestones to projects
- Different milestone types (development, payment, deployment, testing, review)
- Set target dates and amounts
- Mark milestones as complete
- Track completion dates

### 📝 Activity Logging
- Log various activities per project
- Activity types: development, meetings, testing, deployment, documentation, payments, installation
- Track hours worked and amounts received
- Add detailed descriptions
- Date-based activity tracking

### 🎨 Modern UI/UX
- Clean, card-based design
- Light and dark theme support
- Responsive layout for all screen sizes
- Search functionality across customers and projects
- Modal-based forms for easy data entry
- Intuitive navigation with tab-based interface

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful icon library
- **CSS Custom Properties** - Theme system with CSS variables
- **JavaScript** - No TypeScript for faster development

### Backend
- **Express.js** - RESTful API server
- **Node.js** - JavaScript runtime
- **PostgreSQL** - Robust relational database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **Concurrently** - Run frontend and backend simultaneously
- **ESLint** - Code linting
- **ES Modules** - Modern JavaScript module system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (local or remote)
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kc099/personal-crm.git
   cd personal-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   POSTGRES_HOST=your-postgres-host
   POSTGRES_DBNAME=your-database-name
   POSTGRES_PORT=5432
   POSTGRES_USERNAME=your-username
   POSTGRES_PASSWORD=your-password
   PORT=3001
   ```

4. **Database Setup**
   ```bash
   # Set up database schema and sample data
   node setup-db.js
   ```

5. **Start the Application**
   ```bash
   # Start both backend and frontend
   npm start
   
   # Or run separately:
   npm run server  # Backend on port 3001
   npm run dev     # Frontend on port 5173
   ```

## 🌐 API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Projects
- `GET /api/projects` - Get all projects with customer info
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Milestones
- `GET /api/projects/:projectId/milestones` - Get project milestones
- `POST /api/projects/:projectId/milestones` - Create milestone
- `PUT /api/milestones/:id` - Update milestone

### Activities
- `GET /api/projects/:projectId/activities` - Get project activities
- `POST /api/projects/:projectId/activities` - Create activity

## 📁 Project Structure

```
personal-crm/
├── public/                 # Static assets
├── server/                 # Backend API
│   ├── server.js          # Express server
│   └── database.sql       # Database schema
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── Header.jsx
│   │   ├── CustomerCard.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Modal.jsx
│   │   ├── CustomerForm.jsx
│   │   └── ProjectForm.jsx
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles & themes
├── .env                 # Environment variables
├── package.json         # Dependencies & scripts
└── README.md           # This file
```

## 🎨 Theme System

The application supports both light and dark themes with CSS custom properties:

- **Light Theme**: Clean white background with subtle shadows
- **Dark Theme**: Dark blue/slate color scheme
- **Theme Toggle**: Button in header to switch themes
- **Persistent**: Theme preference saved in localStorage

## 🔒 Database Schema

### Customers Table
- `id` - Primary key
- `name` - Customer name (required)
- `email` - Email address (unique, optional)
- `phone` - Phone number (optional)
- `company` - Company name (optional)
- `address` - Physical address (optional)
- `notes` - Additional notes (optional)
- `created_at`, `updated_at` - Timestamps

### Projects Table
- `id` - Primary key
- `name` - Project name (required)
- `description` - Project description
- `customer_id` - Foreign key to customers
- `tech_stack` - Array of technologies
- `github_link` - Repository URL
- `status` - Project status
- `start_date`, `end_date` - Project timeline
- `created_at`, `updated_at` - Timestamps

### Milestones Table
- `id` - Primary key
- `project_id` - Foreign key to projects
- `title` - Milestone title (required)
- `description` - Milestone description
- `milestone_type` - Type of milestone
- `target_date` - Target completion date
- `completed_date` - Actual completion date
- `amount` - Associated amount (payments, etc.)
- `status` - Milestone status
- `created_at`, `updated_at` - Timestamps

### Activities Table
- `id` - Primary key
- `project_id` - Foreign key to projects
- `title` - Activity title (required)
- `description` - Activity description
- `activity_type` - Type of activity
- `hours` - Hours worked
- `amount` - Amount received/paid
- `activity_date` - Date of activity
- `created_at` - Timestamp

## 🚀 Future Enhancements

### Analytics Dashboard
- Revenue tracking and projections
- Project completion rates
- Customer activity insights
- Time tracking analytics
- Performance metrics

### Advanced Features
- File attachments for projects
- Email integration
- Calendar integration
- Task management
- Invoice generation
- Reporting system
- Data export capabilities

### API Extensibility
- Authentication and authorization
- Role-based access control
- API versioning
- Rate limiting
- Webhook support
- Integration with third-party services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Analytics tab is placeholder (coming soon)
- No authentication system (intended for personal use)
- Limited file upload capabilities

## 💡 Tips

- Use the search functionality to quickly find customers or projects
- The theme toggle in the header switches between light and dark modes
- Click "View Details" on project cards to access milestones and activities
- Empty email fields are handled gracefully (stored as NULL)
- All forms include validation and error handling

---

**Built with ❤️ for better project and customer management**
