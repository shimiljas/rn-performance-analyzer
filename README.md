# React Native Performance Analyzer

A comprehensive web-based tool for analyzing React Native application performance. Upload your performance trace JSON and get actionable insights, bottleneck detection, and optimization recommendations.

https://github.com/user-attachments/assets/db2a3790-dd28-4e2c-b603-31519900e353






## Features

- **Performance Health Score** - Overall grade (A-F) based on multiple performance metrics
- **Critical Issues Detection** - Identifies slow renders, heavy components, and bottlenecks
- **Component Analysis** - Detailed breakdown of render times and performance impact
- **State Management Analysis** - Detects context overuse, prop drilling, and unnecessary state
- **Memory & Bridge Analysis** - Identifies memory leaks and bridge communication issues
- **Actionable Recommendations** - Specific optimization suggestions with priority levels
- **Visual Charts** - Interactive performance visualizations using Recharts
- **File Analysis** - Per-file performance metrics and insights

## Demo

Visit the live demo: [https://shimiljas.github.io/rn-performance-analyzer/](https://shimiljas.github.io/rn-performance-analyzer/)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/shimiljas/rn-performance-analyzer.git
cd rn-performance-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will automatically reload when you make changes to the code.

## Building for Production

### Build the application

```bash
npm run build
```

This creates an optimized production build in the `out` directory.

### Preview the production build locally

You can serve the production build locally using any static file server:

```bash
npx serve out
```

## Deployment

### Deploy to GitHub Pages

This project is configured to automatically deploy to GitHub Pages via GitHub Actions.

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Under "Build and deployment" → Source, select **GitHub Actions**

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to the "Actions" tab in your repository
   - Watch the deployment workflow complete
   - Your site will be live at: `https://shimiljas.github.io/rn-performance-analyzer/`

### Deploy to other platforms

The static export works with any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `out` folder
- **AWS S3**: Upload `out` folder contents
- **Cloudflare Pages**: Connect your repository

## How to Use

### 1. Generate Performance Trace

To capture performance data from your React Native app:

**Step 1: Open React DevTools**
- Install [React DevTools](https://react.dev/learn/react-developer-tools) browser extension or standalone app
- Run your React Native app in development mode: `npm start` or `yarn start`
- Open React DevTools and connect to your app

**Step 2: Record Performance Profile**
1. Navigate to the **Profiler** tab in React DevTools
2. Click the **Record** button (circle icon)
3. Interact with your app (navigate, scroll, perform actions)
4. Click **Stop** recording when done
5. Click the **Download** button to export the profiling data as JSON

**Step 3: Save the JSON file**
- The file will be downloaded as `profiling-data.json` or similar
- This contains all the performance metrics needed for analysis

### 2. Upload and Analyze

1. Open the analyzer in your browser
2. Click "Choose File" or drag & drop your JSON trace file
3. View comprehensive performance analysis:
   - Performance grade and health score
   - Critical issues and bottlenecks
   - Component-level metrics
   - Optimization recommendations

### 3. Act on Insights

Follow the prioritized recommendations to optimize your app's performance.

## Project Structure

```
rn-performance-analyzer/
├── components/          # React components
│   ├── FileUpload.tsx          # File upload handler
│   ├── MetricsOverview.tsx     # Metrics summary cards
│   ├── PerformanceInsights.tsx # Main insights display
│   ├── CriticalIssues.tsx      # Critical issues list
│   ├── Recommendations.tsx     # Optimization suggestions
│   ├── ComponentTable.tsx      # Component performance table
│   ├── SlowRendersList.tsx     # Slow renders list
│   └── PageAnalysis.tsx        # Per-page analysis
├── lib/
│   └── analyzer.ts      # Core analysis logic
├── pages/
│   ├── _app.tsx         # Next.js app wrapper
│   └── index.tsx        # Main page
├── styles/
│   └── globals.css      # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions deployment
└── next.config.js       # Next.js configuration
```

## Tech Stack

- **Next.js 14** - React framework with static export
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **GitHub Actions** - CI/CD pipeline

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production-ready static site
- `npm start` - Start Next.js production server (not needed for static export)
- `npm run lint` - Run ESLint for code quality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Inspiration

This project was inspired by [Karim Hekal's article on React Native Performance Debugging](https://medium.com/@karimhekal/how-i-evolved-my-react-native-performance-debugging-and-how-i-measure-performance-optimizations-5277ac5354a1). Special thanks for the insights on measuring and optimizing React Native performance.

## Support

If you have questions or need help, please:
- Open an issue in the repository
- Check existing issues for solutions
- Review the documentation

---

Made with love for the React Native community
