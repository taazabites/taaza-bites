import OptimizedImage from "../components/common/OptimizedImage";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  Flame,
  Sparkles,
  Heart,
  MessageSquare,
  Share2,
  PlusCircle,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Crown,
  Calendar,
  ThumbsUp,
  Camera,
  X,
  Send,
  Star
} from 'lucide-react';
import { Card, Button } from '@/src/components/ui/primitives';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { triggerHaptic } from '@/src/utils/haptics';
import { cn } from '@/src/lib/utils';

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";

type ActiveTab = 'feed' | 'challenges' | 'friends' | 'leaderboard' | 'transformations';

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge: string;
  timeAgo: string;
  content: string;
  mealPlan: string;
  image?: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  tags: string[];
}

interface MonthlyChallenge {
  id: string;
  title: string;
  month: string;
  category: string;
  participantsCount: number;
  daysRemaining: number;
  xpReward: number;
  description: string;
  progress: number;
  joined: boolean;
  image: string;
  badgeName: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  level: string;
  currentGoal: string;
  status: 'connected' | 'pending' | 'suggested';
  mutualCount: number;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  badge: string;
  change: 'up' | 'down' | 'same';
}

interface TransformationStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  age: number;
  duration: string;
  weightLostKg: number;
  beforeImage: string;
  afterImage: string;
  storyText: string;
  planUsed: string;
  applauseCount: number;
  isApplauded: boolean;
  keyAchievement: string;
}

export default function CommunityPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // New Post Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('High Protein');

  // Transformation Modal
  const [showTransformationModal, setShowTransformationModal] = useState(false);
  const [transformStoryText, setTransformStoryText] = useState('');
  const [transformWeightLost, setTransformWeightLost] = useState('8.5');
  const [transformDuration, setTransformDuration] = useState('60 Days');

  // Community Feed State
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      authorName: 'Ananya Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fm=webp&w=150',
      authorBadge: 'Level 5 • Metabolic Master',
      timeAgo: '2 hours ago',
      content: 'Hit my 30-day continuous streak with TaazaBites High Protein Keto Bowl! Energy levels during morning workouts have skyrocketed! 💪🔥',
      mealPlan: 'High Protein Keto',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&w=600',
      likes: 42,
      commentsCount: 9,
      isLiked: false,
      tags: ['HighProtein', 'Streak30', 'Keto']
    },
    {
      id: 'p2',
      authorName: 'Rohan Mehta',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fm=webp&w=150',
      authorBadge: 'Level 4 • Clean Eater',
      timeAgo: '5 hours ago',
      content: 'The new Grilled Herb Salmon with Organic Quinoa in today’s lunch slot was pure chef craftsmanship! Loved the macro density.',
      mealPlan: 'Calorie Deficit Pro',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&w=600',
      likes: 28,
      commentsCount: 4,
      isLiked: true,
      tags: ['ChefSpecial', 'CalorieDeficit']
    },
    {
      id: 'p3',
      authorName: 'Dr. Priya Nair',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      authorBadge: 'Verified Nutritionist',
      timeAgo: '1 day ago',
      content: 'Pro-tip for fellow subscribers: Pairing your lunch salad with 500ml lukewarm lemon electrolyte water maximizes nutrient absorption by 25%!',
      mealPlan: 'Diabetes Friendly',
      likes: 89,
      commentsCount: 15,
      isLiked: false,
      tags: ['NutritionTip', 'MetabolicHealth']
    }
  ]);

  // Monthly Challenges State
  const [challenges, setChallenges] = useState<MonthlyChallenge[]>([
    {
      id: 'mc1',
      title: '30-Day Lean Protein Sprint',
      month: 'August 2026',
      category: 'Muscle Growth',
      participantsCount: 1240,
      daysRemaining: 12,
      xpReward: 1000,
      description: 'Consume at least 30g protein per main meal for 30 consecutive days.',
      progress: 65,
      joined: true,
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fm=webp&w=500',
      badgeName: 'Protein Titan'
    },
    {
      id: 'mc2',
      title: 'Zero Refined Sugar Challenge',
      month: 'August 2026',
      category: 'Detox & Energy',
      participantsCount: 890,
      daysRemaining: 18,
      xpReward: 850,
      description: 'Replace all dessert cravings with TaazaBites monkfruit-sweetened treats.',
      progress: 30,
      joined: false,
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fm=webp&w=500',
      badgeName: 'Sugar Shield'
    },
    {
      id: 'mc3',
      title: 'Hydration & Fiber Mastery',
      month: 'August 2026',
      category: 'Gut Wellness',
      participantsCount: 2150,
      daysRemaining: 22,
      xpReward: 500,
      description: 'Pair 3L daily water with high-fiber probiotic meal subscriptions.',
      progress: 0,
      joined: false,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fm=webp&w=500',
      badgeName: 'Gut Guardian'
    }
  ]);

  // Friends State
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: 'f1',
      name: 'Vikram Verma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fm=webp&w=150',
      streakDays: 18,
      level: 'Level 4',
      currentGoal: 'Lean Muscle Gain',
      status: 'connected',
      mutualCount: 12
    },
    {
      id: 'f2',
      name: 'Sneha Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fm=webp&w=150',
      streakDays: 24,
      level: 'Level 5',
      currentGoal: 'Weight Maintenance',
      status: 'connected',
      mutualCount: 8
    },
    {
      id: 'f3',
      name: 'Arjun Das',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fm=webp&w=150',
      streakDays: 9,
      level: 'Level 3',
      currentGoal: 'Keto Fat Loss',
      status: 'pending',
      mutualCount: 4
    },
    {
      id: 'f4',
      name: 'Kavita Roy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fm=webp&w=150',
      streakDays: 14,
      level: 'Level 3',
      currentGoal: 'Intermittent Fasting',
      status: 'suggested',
      mutualCount: 15
    }
  ]);

  // Leaderboard State
  const [leaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, id: 'u1', name: 'Kabir Singhania', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', xp: 8940, streak: 45, badge: '👑 Legend', change: 'same' },
    { rank: 2, id: 'u2', name: 'Sneha Kulkarni', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', xp: 7620, streak: 38, badge: '⚡ Master', change: 'up' },
    { rank: 3, id: 'u3', name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', xp: 7100, streak: 30, badge: '🔥 Elite', change: 'up' },
    { rank: 4, id: 'u4', name: 'Vikram Verma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', xp: 6450, streak: 22, badge: '💎 Champion', change: 'down' },
    { rank: 5, id: 'u5', name: 'You (Alex)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', xp: 5850, streak: 18, badge: '✨ Rising Star', change: 'up' },
    { rank: 6, id: 'u6', name: 'Rohan Mehta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', xp: 5120, streak: 15, badge: '🌟 Pro', change: 'same' }
  ]);

  // Transformation Stories State
  const [transformations, setTransformations] = useState<TransformationStory[]>([
    {
      id: 't1',
      authorName: 'Aarav Patel',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      age: 29,
      duration: '90 Days',
      weightLostKg: 12.4,
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      afterImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500',
      storyText: 'Switching to TaazaBites Keto & High Protein subscription eliminated my afternoon sugar crashes completely. Down 12.4kg and feeling like a athlete again!',
      planUsed: 'Keto & High Protein',
      applauseCount: 184,
      isApplauded: false,
      keyAchievement: '-12.4kg & +35% Energy'
    },
    {
      id: 't2',
      authorName: 'Meera Iyer',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      age: 34,
      duration: '60 Days',
      weightLostKg: 7.2,
      beforeImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
      afterImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
      storyText: 'As a working mother, preparing fresh organic macros daily was impossible. TaazaBites delivered pristine meals right to my desk. My HbA1c dropped from 6.8 to 5.4!',
      planUsed: 'Diabetic Care Balance',
      applauseCount: 240,
      isApplauded: true,
      keyAchievement: 'HbA1c Normalized'
    }
  ]);

  // Like Post Handler
  const handleLikePost = (postId: string) => {
    triggerHaptic('light');
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  // Join Challenge Handler
  const handleJoinChallenge = (challengeId: string) => {
    triggerHaptic('medium');
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        const nextJoined = !c.joined;
        if (nextJoined) {
          showToast(`Joined challenge: ${c.title}! +50 XP bonus added! 🎉`, "success");
        } else {
          showToast(`Left challenge: ${c.title}`, "info");
        }
        return {
          ...c,
          joined: nextJoined,
          participantsCount: nextJoined ? c.participantsCount + 1 : c.participantsCount - 1
        };
      }
      return c;
    }));
  };

  // Friend Request Action
  const handleFriendAction = (friendId: string, action: 'connect' | 'accept' | 'remove') => {
    triggerHaptic('light');
    setFriends(prev => prev.map(f => {
      if (f.id === friendId) {
        if (action === 'connect') {
          showToast(`Friend request sent to ${f.name}!`, "success");
          return { ...f, status: 'pending' };
        } else if (action === 'accept') {
          showToast(`You are now connected with ${f.name}!`, "success");
          return { ...f, status: 'connected' };
        } else {
          return { ...f, status: 'suggested' };
        }
      }
      return f;
    }));
  };

  // Applause Transformation Story
  const handleApplauseStory = (storyId: string) => {
    triggerHaptic('medium');
    setTransformations(prev => prev.map(t => {
      if (t.id === storyId) {
        const nextApplauded = !t.isApplauded;
        return {
          ...t,
          applauseCount: nextApplauded ? t.applauseCount + 1 : t.applauseCount - 1,
          isApplauded: nextApplauded
        };
      }
      return t;
    }));
  };

  // Submit New Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    triggerHaptic('medium');
    const newEntry: Post = {
      id: 'p-' + Date.now(),
      authorName: currentUser?.displayName || 'Alex Morgan',
      authorAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      authorBadge: 'Subscriber • Level 4',
      timeAgo: 'Just now',
      content: newPostContent,
      mealPlan: newPostCategory,
      likes: 1,
      commentsCount: 0,
      isLiked: true,
      tags: [newPostCategory.replace(/\s+/g, ''), 'CommunityWin']
    };

    setPosts([newEntry, ...posts]);
    setNewPostContent('');
    setShowPostModal(false);
    showToast("Posted to TaazaBites Community Feed! +20 XP awarded!", "success");
  };

  // Submit Transformation Story
  const handleCreateTransformation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transformStoryText.trim()) return;

    triggerHaptic('medium');
    const newStory: TransformationStory = {
      id: 't-' + Date.now(),
      authorName: currentUser?.displayName || 'Alex Morgan',
      authorAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      age: 28,
      duration: transformDuration,
      weightLostKg: parseFloat(transformWeightLost) || 5,
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      afterImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500',
      storyText: transformStoryText,
      planUsed: 'High Protein Metabolic',
      applauseCount: 1,
      isApplauded: true,
      keyAchievement: `-${transformWeightLost}kg in ${transformDuration}`
    };

    setTransformations([newStory, ...transformations]);
    setTransformStoryText('');
    setShowTransformationModal(false);
    showToast("Transformation story submitted! Earned +500 XP!", "success");
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          
          <PageHeader 
            title="Metabolic Community Hub"
            description="Connect with fellow subscribers, crush monthly challenges, celebrate transformation milestones, and climb the global health leaderboard."
            badge="TaazaBites Tribe"
            icon={Users}
            gradient="from-emerald-950 via-zinc-900 to-teal-950"
          >
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={() => setShowPostModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-6 h-12 rounded-2xl shadow-lg shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Share Update
              </Button>
              <Button
                onClick={() => setShowTransformationModal(true)}
                variant="outline"
                className="border-white/20 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest px-6 h-12 rounded-2xl backdrop-blur-md"
              >
                <Trophy className="w-4 h-4 mr-2 text-amber-400" /> Post Story
              </Button>
            </div>
          </PageHeader>

        {/* Community Navigation Pills Bar */}
        <div className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('feed'); triggerHaptic('light'); }}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'feed'
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Community Feed
            </button>

            <button
              onClick={() => { setActiveTab('challenges'); triggerHaptic('light'); }}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'challenges'
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Zap className="w-4 h-4" />
              Monthly Challenges
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px]">
                {challenges.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('friends'); triggerHaptic('light'); }}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'friends'
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Users className="w-4 h-4" />
              Friends Network
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px]">
                {friends.filter(f => f.status === 'connected').length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('leaderboard'); triggerHaptic('light'); }}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'leaderboard'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              Leaderboard
            </button>

            <button
              onClick={() => { setActiveTab('transformations'); triggerHaptic('light'); }}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'transformations'
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <Trophy className="w-4 h-4" />
              Transformation Stories
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: COMMUNITY FEED */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Feed Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Share Quick Box */}
                <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex items-center gap-4">
                  <OptimizedImage
                    src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fm=webp'}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-2xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                    
                  />
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 text-zinc-500 dark:text-zinc-400 text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    What did you eat or achieve today, {currentUser?.displayName?.split(' ')[0] || 'Friend'}?
                  </button>
                  <Button
                    onClick={() => setShowPostModal(true)}
                    className="bg-emerald-600 text-white rounded-2xl h-11 px-4 text-xs font-black uppercase tracking-widest shrink-0"
                  >
                    Post
                  </Button>
                </Card>

                {/* Tag Filters */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {['All', 'HighProtein', 'Keto', 'NutritionTip', 'Streak30', 'CalorieDeficit'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap",
                        selectedTag === tag
                          ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Feed Posts */}
                {posts
                  .filter(p => selectedTag === 'All' || p.tags.includes(selectedTag))
                  .map((post) => (
                    <Card key={post.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-5">
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <OptimizedImage 
                            src={post.authorAvatar} 
                            alt={post.authorName} 
                            className="w-12 h-12 rounded-2xl object-cover shrink-0" 
                            referrerPolicy="no-referrer" 
                            
                          />
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{post.authorName}</h4>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">{post.authorBadge}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{post.timeAgo}</span>
                      </div>

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{post.content}</p>

                      {/* Image if available */}
                      {post.image && (
                        <div className="rounded-2xl overflow-hidden max-h-80 bg-zinc-100 dark:bg-zinc-800">
                          <OptimizedImage 
                            src={post.image} 
                            alt="Post content" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            
                          />
                        </div>
                      )}

                      {/* Tags & Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          {post.tags.map(t => (
                            <span key={t} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer",
                              post.isLiked ? "text-rose-500 font-black" : "text-zinc-500 hover:text-zinc-800"
                            )}
                          >
                            <Heart className={cn("w-4 h-4", post.isLiked && "fill-rose-500 text-rose-500")} />
                            <span>{post.likes}</span>
                          </button>

                          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>

              {/* Sidebar Info Column */}
              <div className="space-y-6">
                
                {/* Active Challenge Widget */}
                <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-[2.5rem] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      Featured Challenge
                    </span>
                    <span className="text-xs font-black text-amber-600">+1000 XP</span>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-zinc-900 dark:text-white">30-Day Lean Protein Sprint</h4>
                    <p className="text-xs text-zinc-500 mt-1">1,240 subscribers currently crushing protein goals this month.</p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('challenges')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-xl h-10"
                  >
                    View All Challenges
                  </Button>
                </Card>

                {/* Top Community Champions */}
                <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">Top Tribe Members</h4>
                    <button onClick={() => setActiveTab('leaderboard')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      See All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {leaderboard.slice(0, 3).map((usr) => (
                      <div key={usr.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-xs font-black text-amber-500 text-center">#{usr.rank}</span>
                          <OptimizedImage 
                            src={usr.avatar} 
                            alt={usr.name} 
                            className="w-9 h-9 rounded-xl object-cover" 
                            referrerPolicy="no-referrer" 
                            
                          />
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{usr.name}</p>
                            <p className="text-[9px] font-bold text-zinc-400">{usr.xp} XP</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black">
                          🔥 {usr.streak}d
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MONTHLY CHALLENGES */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Active Monthly Challenges</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Participate with thousands of subscribers to earn exclusive badges and wallet credits</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-5 group hover:border-amber-500/50 transition-all">
                    <div className="space-y-4">
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <OptimizedImage 
                          src={challenge.image} 
                          alt={challenge.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                          
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-zinc-950/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          {challenge.month}
                        </div>
                        <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          +{challenge.xpReward} XP
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{challenge.category}</span>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight mt-0.5">{challenge.title}</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">{challenge.description}</p>
                      </div>

                      {challenge.joined && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Your Progress</span>
                            <span className="text-amber-600 font-bold">{challenge.progress}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${challenge.progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        <span>👥 {challenge.participantsCount} Joined</span>
                        <span>⏳ {challenge.daysRemaining} days left</span>
                      </div>

                      <Button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className={cn(
                          "w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          challenge.joined
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 hover:text-rose-600"
                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                        )}
                      >
                        {challenge.joined ? "Joined ✓ (Click to Exit)" : "Join Challenge 🔥"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: FRIENDS NETWORK */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Friends & Accountability Tribe</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Track friends' active meal streaks and motivate each other</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {friends.map((friend) => (
                  <Card key={friend.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-4 text-center">
                    <div className="space-y-3">
                      <div className="relative w-20 h-20 mx-auto">
                        <OptimizedImage 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-20 h-20 rounded-2xl object-cover shadow-md" 
                          referrerPolicy="no-referrer" 
                          
                        />
                        <span className="absolute -bottom-2 right-0 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                          🔥 {friend.streakDays}d
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white">{friend.name}</h4>
                        <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mt-0.5">{friend.level}</p>
                      </div>

                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                        Target: {friend.currentGoal}
                      </div>
                    </div>

                    <div className="pt-2">
                      {friend.status === 'connected' ? (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-2.5 rounded-xl">
                          <UserCheck className="w-4 h-4" /> Connected
                        </div>
                      ) : friend.status === 'pending' ? (
                        <Button
                          disabled
                          className="w-full h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-xl"
                        >
                          Request Pending
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleFriendAction(friend.id, 'connect')}
                          className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20"
                        >
                          <UserPlus className="w-4 h-4 mr-1.5" /> Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Podium Display for Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* 2nd Place */}
                <Card className="p-6 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-center space-y-4 order-2 md:order-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-300 text-zinc-900 font-black text-sm flex items-center justify-center shadow-lg">
                    #2
                  </div>
                  <OptimizedImage 
                    src={leaderboard[1].avatar} 
                    alt={leaderboard[1].name} 
                    className="w-20 h-20 mx-auto rounded-2xl object-cover shadow-md" 
                    referrerPolicy="no-referrer" 
                    
                  />
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">{leaderboard[1].name}</h3>
                    <span className="text-xs font-black text-amber-500">{leaderboard[1].xp} XP</span>
                  </div>
                </Card>

                {/* 1st Place */}
                <Card className="p-8 bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-400 text-white rounded-[3rem] text-center space-y-4 order-1 md:order-2 shadow-2xl relative">
                  <Crown className="w-8 h-8 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-zinc-950 font-black text-base flex items-center justify-center shadow-xl">
                    #1
                  </div>
                  <OptimizedImage 
                    src={leaderboard[0].avatar} 
                    alt={leaderboard[0].name} 
                    className="w-24 h-24 mx-auto rounded-3xl object-cover shadow-2xl ring-4 ring-amber-400" 
                    referrerPolicy="no-referrer" 
                    
                  />
                  <div>
                    <h3 className="text-xl font-black">{leaderboard[0].name}</h3>
                    <span className="text-sm font-black text-amber-400">{leaderboard[0].xp} XP • 🔥 {leaderboard[0].streak}d Streak</span>
                  </div>
                </Card>

                {/* 3rd Place */}
                <Card className="p-6 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-center space-y-4 order-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg">
                    #3
                  </div>
                  <OptimizedImage 
                    src={leaderboard[2].avatar} 
                    alt={leaderboard[2].name} 
                    className="w-20 h-20 mx-auto rounded-2xl object-cover shadow-md" 
                    referrerPolicy="no-referrer" 
                    
                  />
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">{leaderboard[2].name}</h3>
                    <span className="text-xs font-black text-amber-500">{leaderboard[2].xp} XP</span>
                  </div>
                </Card>
              </div>

              {/* Full Ranks Table */}
              <Card className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-3">
                {leaderboard.map((usr) => (
                  <div
                    key={usr.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all",
                      usr.name.includes("You")
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 font-bold"
                        : "bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-center text-sm font-black text-zinc-500">#{usr.rank}</span>
                        <OptimizedImage 
                          src={usr.avatar} 
                          alt={usr.name} 
                          className="w-11 h-11 rounded-xl object-cover" 
                          referrerPolicy="no-referrer" 
                          
                        />
                      <div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white">{usr.name}</h4>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{usr.badge}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">🔥 {usr.streak} days</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-xl">
                        {usr.xp} XP
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

          {/* TAB 5: TRANSFORMATION STORIES */}
          {activeTab === 'transformations' && (
            <motion.div
              key="transformations-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Transformation Stories</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Real health journeys inspired by TaazaBites customized meal subscriptions</p>
                </div>

                <Button
                  onClick={() => setShowTransformationModal(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-6 h-11 rounded-2xl shadow-lg shadow-rose-500/20"
                >
                  <Trophy className="w-4 h-4 mr-2" /> Submit My Story
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {transformations.map((item) => (
                  <Card key={item.id} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <OptimizedImage 
                            src={item.authorAvatar} 
                            alt={item.authorName} 
                            className="w-12 h-12 rounded-2xl object-cover shrink-0" 
                            referrerPolicy="no-referrer" 
                            
                          />
                        <div>
                          <h4 className="text-base font-black text-zinc-900 dark:text-white">{item.authorName}, {item.age}</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan: {item.planUsed}</p>
                        </div>
                      </div>

                      <span className="px-4 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black uppercase tracking-widest">
                        {item.keyAchievement}
                      </span>
                    </div>

                    {/* Before & After Split View */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative rounded-2xl overflow-hidden h-52 bg-zinc-100 dark:bg-zinc-800">
                          <OptimizedImage 
                            src={item.beforeImage} 
                            alt="Before" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            
                          />
                        <span className="absolute bottom-3 left-3 bg-zinc-950/80 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest backdrop-blur-sm">
                          Before Day 1
                        </span>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden h-52 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-emerald-500/50">
                          <OptimizedImage 
                            src={item.afterImage} 
                            alt="After" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            
                          />
                        <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-md">
                          After {item.duration}
                        </span>
                      </div>
                    </div>

                    {/* Story Paragraph */}
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed italic">
                      "{item.storyText}"
                    </p>

                    {/* Footer / Applause Action */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Verified Subscriber Story
                      </span>

                      <Button
                        onClick={() => handleApplauseStory(item.id)}
                        className={cn(
                          "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                          item.isApplauded
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600"
                        )}
                      >
                        👏 Applause ({item.applauseCount})
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* MODAL 1: SHARE UPDATE */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Share Community Update</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Post updates, meal ratings, or diet advice</p>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Tag Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-xs font-bold text-zinc-900 dark:text-white"
                  >
                    <option value="High Protein">High Protein</option>
                    <option value="Keto">Keto</option>
                    <option value="Calorie Deficit">Calorie Deficit</option>
                    <option value="Chef Review">Chef Review</option>
                    <option value="Nutrition Tip">Nutrition Tip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Update Content</label>
                  <textarea
                    rows={4}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your meal experience, macros, or daily fitness streak..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-4 text-xs font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4 mr-2" /> Publish Update (+20 XP)
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: SUBMIT TRANSFORMATION STORY */}
        {showTransformationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowTransformationModal(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Post Your Transformation Story</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Inspire thousands and earn +500 XP instantly</p>
              </div>

              <form onSubmit={handleCreateTransformation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Weight Change (kg)</label>
                    <input
                      type="text"
                      value={transformWeightLost}
                      onChange={(e) => setTransformWeightLost(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Time Duration</label>
                    <input
                      type="text"
                      value={transformDuration}
                      onChange={(e) => setTransformDuration(e.target.value)}
                      placeholder="e.g. 60 Days"
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Your Story & Experience</label>
                  <textarea
                    rows={4}
                    value={transformStoryText}
                    onChange={(e) => setTransformStoryText(e.target.value)}
                    placeholder="Describe how TaazaBites meal plans helped you achieve your target body composition or metabolic energy..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-4 text-xs font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-rose-500/20"
                >
                  <Trophy className="w-4 h-4 mr-2" /> Submit Story (+500 XP)
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
