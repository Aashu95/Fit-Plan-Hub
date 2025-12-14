# FitPlanHub - Trainers & Users Platform

A comprehensive fitness platform where certified trainers create fitness plans and users purchase & follow these plans.

## 🚀 Features

### User & Trainer Authentication
- ✅ Signup & login for both trainers and regular users
- ✅ Password hashing & JWT token authentication
- ✅ Role-based access control

### Trainer Dashboard
- ✅ Create, edit, and delete fitness plans
- ✅ Plan details include title, description, price, and duration
- ✅ View subscription statistics and revenue
- ✅ Manage all created plans

### User Features
- ✅ Browse all available fitness plans
- ✅ Subscribe to plans (simulated payment)
- ✅ Follow/unfollow trainers
- ✅ Personalized feed showing plans from followed trainers
- ✅ View subscribed plans with full access

### Access Control
- ✅ Only subscribed users can view full plan details
- ✅ Non-subscribers see preview information only
- ✅ Role-based API permissions

## 🛠️ Technology Stack

### Backend
- **Next.js 15** with App Router
- **PostgreSQL** with Prisma ORM
- **TypeScript** for type safety
- **JWT** for authentication
- **Zustand** for state management
- **SWR** for data fetching

### Frontend
- **React 19** with hooks
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** icons
- **Framer Motion** for animations

### Database
- **PostgreSQL** as primary database
- **Prisma** as ORM
- Comprehensive relational schema

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── plans/         # Fitness plan CRUD
│   │   ├── subscriptions/ # Subscription management
│   │   ├── follow/        # Follow/unfollow trainers
│   │   └── feed/          # Personalized feed
│   └── page.tsx           # Main application page
├── components/             # React components
│   ├── AuthScreen.tsx     # Login/Register interface
│   ├── UserDashboard.tsx  # User interface
│   └── TrainerDashboard.tsx # Trainer interface
├── lib/                   # Utility libraries
│   ├── auth.ts           # JWT utilities
│   ├── db.ts             # Prisma client
│   └── swr.ts            # SWR configuration
├── store/                # Zustand stores
│   └── auth.ts           # Authentication state
└── prisma/               # Database schema
    ├── schema.prisma     # Database model
    └── seed.ts           # Seed data
```

## 🗄️ Database Schema

### Users
- Authentication (email, password, name)
- Role-based access (USER/TRAINER)
- Profile information (avatar)

### Fitness Plans
- Created by trainers
- Title, description, price, duration
- Related to users through subscriptions

### Subscriptions
- Links users to fitness plans
- Tracks subscription status
- Enables access control

### Follows
- Many-to-many relationship
- Users can follow multiple trainers
- Powers personalized feed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitplanhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/fitplanhub"
   JWT_SECRET="your-super-secret-jwt-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Demo Accounts

The application comes with pre-seeded demo accounts:

### Trainers
- **Email:** john@trainer.com
- **Password:** trainer123
- **Role:** Certified Trainer

- **Email:** sarah@trainer.com  
- **Password:** trainer123
- **Role:** Certified Trainer

- **Email:** mike@trainer.com
- **Password:** trainer123
- **Role:** Certified Trainer

### Users
- **Email:** alice@example.com
- **Password:** user123
- **Role:** Regular User

- **Email:** bob@example.com
- **Password:** user123
- **Role:** Regular User

## 📖 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Fitness Plans
- `GET /api/plans` - List all plans
- `POST /api/plans` - Create plan (trainers only)
- `GET /api/plans/[id]` - Get plan details
- `PUT /api/plans/[id]` - Update plan (trainers only)
- `DELETE /api/plans/[id]` - Delete plan (trainers only)

### Subscriptions
- `GET /api/subscriptions` - List user subscriptions
- `POST /api/subscriptions` - Subscribe to plan

### Social Features
- `POST /api/follow` - Follow trainer
- `DELETE /api/follow` - Unfollow trainer
- `GET /api/feed` - Get personalized feed

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- API route protection with middleware
- Input validation and sanitization

## 🎨 UI/UX Features

- Responsive design for all devices
- Dark/light theme support
- Loading states and error handling
- Smooth animations and transitions
- Accessible semantic HTML
- Keyboard navigation support

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure JWT secret key
- `NEXTAUTH_URL` - Application URL
- `STRIPE_KEYS` - Payment processing (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Authentication Problems
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify API routes are working

### Build Errors
- Run `npm run lint` to check for issues
- Ensure all dependencies are installed
- Check TypeScript types

## 📊 Performance

- Optimized database queries with Prisma
- Efficient data fetching with SWR
- Client-side state management with Zustand
- Code splitting with Next.js
- Image optimization with Next.js Image component

## 🔮 Future Enhancements

- Real Stripe payment integration
- Real-time notifications
- Mobile app development
- Advanced analytics dashboard
- Video content support
- Community features
- Progress tracking
- Nutrition plans integration