# NanoClip Setup Guide

## Development Setup

### Frontend (Next.js)```bash
cd nanoclip
npm install
npm run dev
```
- Runs on: http://localhost:3000

### Backend (FastAPI)
```bash
# Option 1: Basic PHP server
php -S localhost:8000

# Option 2: Specify the directory and port (recommended)
php -S localhost:8000 -t .
```
- Runs on: http://localhost:8000

## Production Setup

### Frontend
```bash
cd nanoclip
npm run build
npm start
```

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --workers 4
```

## Configuration

### Environment Variables

Frontend (.env.local):
```plaintext
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (.env):
```plaintext
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
STORAGE_PATH=/path/to/storage
```

### Required Updates
1. Update frontend API endpoints
2. Configure backend CORS settings:
```python
origins = [
    "http://localhost:3000",
    "https://your-production-domain.com"
]
```

## Planned Features

### Security
- Rate limiting
- File type validation
- Max file size checks
- CSRF protection

### Auto-Delete
- View-once deletion
- Timed deletion
- Deletion confirmation
- Cleanup cron job

### UX Improvements
- Loading states
- Error handling
- Success notifications
- Upload progress

### Infrastructure
- Cloud storage integration
- Database migrations
- Logging system
- Monitoring

## Troubleshooting

Common Issues:
1. CORS errors: Verify backend CORS settings
2. File permissions: Check storage directory permissions
3. Port conflicts: Ensure ports 3000/8000 are available
4. Database connection: Verify PostgreSQL status
