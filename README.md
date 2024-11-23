# NanoClip

NanoClip is a modern, fast, and secure clipboard sharing solution inspired by cl1p.net. Share text, files, and more through unique URLs with optional password protection.

<!-- ![NanoClip Banner](path/to/banner-image.png) -->

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nanoclip.git
cd nanoclip
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Features

### Core Features
- **Quick Sharing**: Share content through unique URLs
- **Password Protection**: Secure sensitive clips with passwords
- **File Support**: Upload and share various file types
- **Expiration Dates**: Set automatic expiration for temporary clips
- **Mobile Responsive**: Works seamlessly across all devices

### URL Structure
- Public clips: `nanoclip.com/clips/your-clip-name`
- Protected clips: `nanoclip.com/clips/protected-your-clip-name`

## 🛠️ Development

### Tech Stack
- Next.js 14
- React
- Tailwind CSS
- Framer Motion
- ShadcnUI
- TypeScript

### Project Structure
```
nanoclip/
├── app/                    # Next.js app directory
│   ├── components/         # Reusable components
│   ├── clips/             # Clip-related pages
│   ├── upload/            # Upload functionality
│   └── download/          # Download functionality
├── public/                # Static assets
├── styles/                # Global styles
└── lib/                   # Utility functions
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📝 Usage Guide

### Creating a Clip
1. Visit the homepage
2. Click "Upload"
3. Add your content (text, files, etc.)
4. Optional: Set password protection
5. Optional: Set expiration date
6. Click "Create Clip"
7. Copy and share the generated URL

### Accessing a Clip
1. Visit the clip URL directly, or
2. Go to the "Download" page
3. Enter the clip name
4. Enter password if required
5. View and download content

### Password Protection
- Add "protected-" prefix to create password-protected clips
- Secure sharing for sensitive information
- Password required for access

## 🔒 Security

### Best Practices
- Don't share sensitive information in public clips
- Use strong passwords for protected clips
- Be aware of clip expiration dates
- Don't reuse clip URLs for sensitive content

### Data Privacy
- Clips are stored securely
- Password-protected clips use encryption
- Expired clips are automatically deleted
- No tracking or analytics on clip content

## 🙏 Acknowledgments

- Inspired by cl1p.net
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

Made with ❤️ by Nana Amoako# nanoclip
