import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, BookOpen, Video, FileText, ExternalLink, 
  Clock, TrendingUp, Star, ChevronRight, ChevronLeft, Sparkles, Loader2, ArrowUpRight
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: 'news' | 'material' | 'video' | 'article';
  source: string;
  url: string;
  imageUrl?: string;
  timestamp: string;
  trending?: boolean;
  featured?: boolean;
  author?: string;
}

interface StudyNewsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getCategoryIcon = (category: NewsItem['category']) => {
  switch (category) {
    case 'news':
      return <Newspaper className="w-4 h-4" />;
    case 'material':
      return <BookOpen className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'article':
      return <FileText className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: NewsItem['category']) => {
  switch (category) {
    case 'news':
      return 'bg-blue-500/10 text-blue-500';
    case 'material':
      return 'bg-green-500/10 text-green-500';
    case 'video':
      return 'bg-red-500/10 text-red-500';
    case 'article':
      return 'bg-purple-500/10 text-purple-500';
  }
};

export function StudyNewsPopup({ open, onOpenChange }: StudyNewsPopupProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('studybuddy-saved-news');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch real study-related news from NewsAPI via a CORS proxy or public education feeds
  useEffect(() => {
    if (open && newsItems.length === 0) {
      fetchStudyNews();
    }
  }, [open]);

  const fetchStudyNews = async () => {
    setLoading(true);
    try {
      // Using the DEV.to API for education/study related articles (free, no API key needed)
      const response = await fetch('https://dev.to/api/articles?tag=education&per_page=15');
      const data = await response.json();
      
      const mappedNews: NewsItem[] = data.map((article: any, index: number) => ({
        id: article.id.toString(),
        title: article.title,
        description: article.description || 'Click to read more about this educational article.',
        content: article.description,
        category: index % 4 === 0 ? 'news' : index % 4 === 1 ? 'article' : index % 4 === 2 ? 'material' : 'video',
        source: article.user?.name || 'DEV Community',
        url: article.url,
        imageUrl: article.cover_image || article.social_image,
        timestamp: new Date(article.published_at).toLocaleDateString(),
        trending: article.positive_reactions_count > 50,
        featured: index === 0,
        author: article.user?.name,
      }));

      // Add placement and exam tips content
      const placementExamContent: NewsItem[] = [
        {
          id: 'placement-1',
          title: 'Campus Placement Preparation Guide 2025',
          description: 'Complete roadmap for cracking campus placements with aptitude, coding, and interview tips.',
          content: `Getting placed in your dream company requires a strategic approach. Here's your complete guide:

**Aptitude Preparation:**
• Practice quantitative aptitude daily - focus on percentages, ratios, and time-speed-distance
• Improve logical reasoning with puzzles and pattern recognition
• Work on verbal ability through reading and vocabulary building

**Technical Skills:**
• Master at least one programming language (Python, Java, or C++)
• Practice Data Structures & Algorithms on platforms like LeetCode
• Build 2-3 solid projects for your portfolio

**Soft Skills:**
• Practice mock interviews with peers
• Work on communication and presentation skills
• Prepare your elevator pitch

**Interview Tips:**
• Research the company thoroughly before interviews
• Prepare STAR method answers for behavioral questions
• Ask thoughtful questions to interviewers`,
          category: 'material',
          source: 'Career Guide',
          url: '#',
          timestamp: 'Updated today',
          trending: true,
          featured: false,
          author: 'Career Experts',
        },
        {
          id: 'exam-1',
          title: 'Effective Exam Study Strategies That Actually Work',
          description: 'Science-backed techniques to maximize your exam preparation and performance.',
          content: `Transform your exam preparation with these proven strategies:

**Before Exams:**
• Create a realistic study schedule 2-3 weeks before
• Use active recall instead of passive reading
• Practice with previous year question papers
• Take regular breaks using the Pomodoro technique

**Study Techniques:**
• Teach concepts to others (Feynman Technique)
• Create mind maps for complex topics
• Use flashcards for quick revision
• Group similar topics together

**During Exams:**
• Read all questions before starting
• Allocate time based on marks
• Start with questions you're confident about
• Review answers if time permits

**Stay Healthy:**
• Get 7-8 hours of sleep before exams
• Eat nutritious meals
• Stay hydrated
• Exercise to reduce stress`,
          category: 'article',
          source: 'Study Tips',
          url: '#',
          timestamp: 'Featured',
          trending: true,
          featured: false,
          author: 'Education Experts',
        },
        {
          id: 'placement-2',
          title: 'Top 10 Companies Hiring Fresh Graduates in 2025',
          description: 'Latest placement opportunities and salary packages for freshers across industries.',
          content: `The job market for fresh graduates is promising. Here are the top hiring companies:

**Tech Giants:**
1. Google - Average package: ₹25-40 LPA
2. Microsoft - Average package: ₹20-35 LPA
3. Amazon - Average package: ₹18-30 LPA

**Product Companies:**
4. Flipkart - Average package: ₹15-25 LPA
5. Swiggy/Zomato - Average package: ₹12-20 LPA

**Consulting:**
6. Deloitte - Average package: ₹8-15 LPA
7. KPMG - Average package: ₹7-12 LPA

**Startups:**
8. Razorpay - Competitive packages with ESOPs
9. CRED - Known for innovative culture
10. Meesho - Fast-growing e-commerce

**Tips to Get Noticed:**
• Build a strong LinkedIn profile
• Contribute to open source projects
• Network through alumni connections
• Apply through employee referrals`,
          category: 'news',
          source: 'Placement News',
          url: '#',
          timestamp: 'New',
          trending: true,
          featured: false,
          author: 'Placement Cell',
        },
        {
          id: 'exam-2',
          title: 'Last Minute Revision Tips for Competitive Exams',
          description: 'Quick revision strategies to boost your score in the final days before exams.',
          content: `When time is short, smart revision is key:

**Day Before Exam:**
• Review your notes and flashcards only
• Don't start new topics
• Focus on formulas and key concepts
• Get adequate sleep

**Quick Revision Techniques:**
• Use mnemonics for lists
• Review diagrams and flowcharts
• Read summaries you've prepared
• Glance through highlighted portions

**Mental Preparation:**
• Stay calm and positive
• Visualize success
• Avoid discussing with anxious peers
• Pack everything the night before

**Common Mistakes to Avoid:**
• Don't pull all-nighters
• Don't skip meals
• Don't rely on guesswork
• Don't panic if you forget something`,
          category: 'article',
          source: 'Exam Guide',
          url: '#',
          timestamp: 'Essential',
          trending: false,
          featured: false,
          author: 'Academic Mentors',
        },
      ];

      mappedNews.push(...placementExamContent);

      // Also fetch from a study tips RSS feed proxy
      try {
        const studyTipsResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.edutopia.org/rss.xml');
        const studyTipsData = await studyTipsResponse.json();
        
        if (studyTipsData.items) {
          const studyTipsNews: NewsItem[] = studyTipsData.items.slice(0, 8).map((item: any, index: number) => ({
            id: `edutopia-${index}`,
            title: item.title,
            description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Educational resource from Edutopia.',
            content: item.description?.replace(/<[^>]*>/g, ''),
            category: 'article' as const,
            source: 'Edutopia',
            url: item.link,
            imageUrl: item.enclosure?.link || item.thumbnail,
            timestamp: new Date(item.pubDate).toLocaleDateString(),
            trending: index < 3,
            featured: false,
            author: item.author,
          }));
          
          mappedNews.push(...studyTipsNews);
        }
      } catch (e) {
        console.log('RSS feed unavailable, using primary source');
      }

      // Shuffle to mix content types
      const shuffled = mappedNews.sort(() => Math.random() - 0.5);
      // Keep featured item first
      const featured = shuffled.find(item => item.featured);
      const rest = shuffled.filter(item => !item.featured);
      setNewsItems(featured ? [featured, ...rest] : shuffled);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to comprehensive mock data
      setNewsItems([
        {
          id: '1',
          title: 'New AI-Powered Learning Techniques for 2025',
          description: 'Discover how artificial intelligence is revolutionizing the way students learn and retain information.',
          content: 'Artificial intelligence is transforming education in unprecedented ways. From personalized learning paths to intelligent tutoring systems, AI is helping students learn more effectively than ever before. Studies show that AI-assisted learning can improve retention rates by up to 40% and reduce study time by 25%.',
          category: 'news',
          source: 'Education Weekly',
          url: '#',
          timestamp: '2 hours ago',
          trending: true,
          featured: true,
        },
        {
          id: '2',
          title: 'Campus Placement Success Stories',
          description: 'Learn from students who cracked top company interviews with practical tips and strategies.',
          content: 'Read inspiring stories from students who successfully landed jobs at top companies. They share their preparation strategies, interview experiences, and valuable advice for aspiring candidates.',
          category: 'material',
          source: 'Career Hub',
          url: '#',
          timestamp: '1 day ago',
        },
        {
          id: '3',
          title: 'Exam Preparation: 30-Day Study Plan',
          description: 'Structured study plan to help you prepare effectively for competitive exams.',
          content: 'This comprehensive 30-day plan breaks down your preparation into manageable daily tasks. Week 1-2: Foundation building. Week 3: Practice and revision. Week 4: Mock tests and final review.',
          category: 'article',
          source: 'Study Planner',
          url: '#',
          timestamp: '3 hours ago',
          trending: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveItem = (itemId: string) => {
    const newSaved = savedItems.includes(itemId)
      ? savedItems.filter(id => id !== itemId)
      : [...savedItems, itemId];
    setSavedItems(newSaved);
    localStorage.setItem('studybuddy-saved-news', JSON.stringify(newSaved));
  };

  const filteredItems = selectedCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const featuredItem = newsItems.find(item => item.featured);
  const trendingItems = newsItems.filter(item => item.trending);
  const savedNewsItems = newsItems.filter(item => savedItems.includes(item.id));

  // Detail View
  if (selectedNews) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header with back button */}
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNews(null)}
                className="mb-4 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to News
              </Button>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(selectedNews.category)}`}>
                  {getCategoryIcon(selectedNews.category)}
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2 capitalize">
                    {selectedNews.category}
                  </Badge>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedNews.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>{selectedNews.source}</span>
                    <span>•</span>
                    <span>{selectedNews.timestamp}</span>
                    {selectedNews.author && (
                      <>
                        <span>•</span>
                        <span>By {selectedNews.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 px-6 py-6">
              {selectedNews.imageUrl && (
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
              )}
              <div className="space-y-4">
                {/* Render content with proper formatting */}
                {(selectedNews.content || selectedNews.description).split('\n\n').map((paragraph, idx) => (
                  <div key={idx}>
                    {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                      <h3 className="font-bold text-foreground text-lg mt-4 mb-2">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    ) : paragraph.startsWith('**') ? (
                      <h4 className="font-semibold text-foreground mt-3 mb-2">
                        {paragraph.split('**')[1]}
                        <span className="font-normal text-muted-foreground">
                          {paragraph.split('**').slice(2).join('')}
                        </span>
                      </h4>
                    ) : paragraph.startsWith('•') || paragraph.includes('\n•') ? (
                      <ul className="list-disc list-inside space-y-1 text-foreground/90">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i} className="text-sm leading-relaxed">
                            {item.replace('•', '').trim()}
                          </li>
                        ))}
                      </ul>
                    ) : paragraph.match(/^\d+\./) ? (
                      <ol className="list-decimal list-inside space-y-1 text-foreground/90">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i} className="text-sm leading-relaxed">
                            {item.replace(/^\d+\.\s*/, '').trim()}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-foreground/90 leading-relaxed text-sm">
                        {paragraph}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSaveItem(selectedNews.id)}
                className="gap-2"
              >
                <Star className={`w-4 h-4 ${savedItems.includes(selectedNews.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {savedItems.includes(selectedNews.id) ? 'Saved' : 'Save for Later'}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => window.open(selectedNews.url, '_blank')}
              >
                Read Full Article
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-xl">Study News & Materials</DialogTitle>
                <DialogDescription>
                  Stay updated with the latest study resources and educational news
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="feed" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
              <TabsTrigger value="saved" className="flex-1">
                Saved {savedNewsItems.length > 0 && `(${savedNewsItems.length})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="m-0">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Featured Section */}
                {featuredItem && (
                  <div className="px-6 py-4">
                    <div 
                      className="relative overflow-hidden rounded-xl gradient-primary p-6 text-primary-foreground cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setSelectedNews(featuredItem)}
                    >
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/20 text-white hover:bg-white/30">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                          <Clock className="w-4 h-4" />
                          {featuredItem.timestamp}
                          <span>•</span>
                          {featuredItem.source}
                        </div>
                        <h3 className="text-xl font-bold">{featuredItem.title}</h3>
                        <p className="text-primary-foreground/80 line-clamp-2">{featuredItem.description}</p>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="mt-2 bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                          Read More
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div className="px-6 py-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'news', 'material', 'video', 'article'].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize shrink-0"
                      >
                        {category === 'all' ? 'All' : category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* News List */}
                <ScrollArea className="h-[400px] px-6 pb-6">
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedNews(item)}
                        className="group p-4 rounded-xl border border-border bg-card hover:shadow-medium transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-16 h-16 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.trending && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp} • {item.source}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveItem(item.id);
                              }}
                            >
                              <Star className={`w-4 h-4 ${savedItems.includes(item.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          <TabsContent value="trending" className="m-0">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[500px] px-6 py-4">
                <div className="space-y-3">
                  {trendingItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group p-4 rounded-xl border border-border bg-card hover:shadow-medium transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-primary-foreground font-bold shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getCategoryColor(item.category)}>
                              {getCategoryIcon(item.category)}
                              <span className="ml-1 capitalize">{item.category}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.timestamp}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="saved" className="m-0">
            {savedNewsItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No saved items yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Save articles, videos, and study materials to access them later from here.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] px-6 py-4">
                <div className="space-y-3">
                  {savedNewsItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group p-4 rounded-xl border border-border bg-card hover:shadow-medium transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveItem(item.id);
                          }}
                        >
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
