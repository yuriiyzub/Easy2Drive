# 🚗 Easy2Drive NL - Dutch Driving Theory Test App

A comprehensive web application for learning and practicing for the Dutch driving theory exam (CBR Theory Test).

## 🌍 About

Easy2Drive NL helps students prepare for their Dutch driving theory exam with:
- **62 Questions** across 5 categories
- **Interactive quizzes** with instant feedback
- **Progress tracking** and statistics
- **Detailed explanations** for each answer
- Based on **RVV regulations** (Reglement verkeersregels en verkeerstekens)

---

## 📚 Categories

1. **Traffic Signs (RVV)** - 15 questions
   - Learn Dutch traffic signs and RVV codes
   
2. **Road Rules** - 15 questions
   - Master Dutch traffic regulations
   
3. **Priority Rules** - 12 questions
   - Understand right-of-way situations
   
4. **Road Markings** - 10 questions
   - Learn road marking meanings
   
5. **Speed Limits** - 10 questions
   - Know speed limits in different situations

---

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Google OAuth credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

- **Next.js 13** - React framework
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **Tailwind CSS** - Styling
- **SQLite** - Database (development)

---

## 📖 Project Structure

```
Easy2Drive/
├── data/
│   ├── categories.json          # Quiz categories
│   └── questions/                # Question banks
│       ├── traffic-signs.json
│       ├── road-rules.json
│       ├── priority.json
│       ├── road-marking.json
│       └── speed-limits.json
├── pages/
│   ├── api/                      # API routes
│   ├── quiz/                     # Quiz interface
│   ├── dashboard.js              # User dashboard
│   ├── categories.js             # Category selection
│   └── login.js                  # Login page
├── prisma/
│   └── schema.prisma             # Database schema
└── lib/
    └── questions.js              # Quiz logic
```

---

## 🎯 Features

- ✅ Google OAuth authentication
- ✅ 5 quiz categories with 62 questions
- ✅ Progress tracking and statistics
- ✅ Detailed answer explanations
- ✅ Pass/fail evaluation based on mistakes
- ✅ Quiz history
- ✅ Responsive design
- 🔄 **UI Translation to English** (In Progress)

---

## 📝 Quiz System

- **Pass criteria:**
  - Category tests: Maximum 5 mistakes
  - Full exam (20 questions): Maximum 3 mistakes
  
- **Question format:**
  - Multiple choice (3-4 options)
  - One correct answer
  - Detailed explanation for each question
  - Difficulty levels: easy, medium, hard

---

## 🔐 Authentication

Uses NextAuth.js with Google OAuth. Configure in `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 📊 Database

**Development:** SQLite (included)  
**Production:** PostgreSQL recommended

Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t easy2drive-nl .
docker run -p 3000:3000 easy2drive-nl
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License - feel free to use for learning purposes

---

## ⚠️ Disclaimer

This app is for educational purposes. Always refer to official CBR materials for your exam preparation.

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Good luck with your Dutch driving theory exam! 🚗💨**
