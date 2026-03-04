'use client';

import * as React from 'react';
import {
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Zap,
  Star,
  Heart,
  Users,
  Briefcase,
  Code,
  Palette,
  Music,
  Camera,
  Book,
  BookOpen,
  Coffee,
  Lightbulb,
  Award,
  Flag,
  Shield,
  Crown,
  Gem,
  Flame,
  Settings,
  Layout,
  Database,
  Terminal,
  Package,
  Truck,
  MessageSquare,
  Mail,
  Phone,
  Map,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Link2,
  Eye,
  Lock,
  Unlock,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Rocket,
  Target,
  TrendingUp,
  Zap,
  Star,
  Heart,
  Users,
  Briefcase,
  Code,
  Palette,
  Music,
  Camera,
  Book,
  BookOpen,
  Coffee,
  Lightbulb,
  Award,
  Flag,
  Shield,
  Crown,
  Gem,
  Flame,
  Settings,
  Layout,
  Database,
  Terminal,
  Package,
  Truck,
  MessageSquare,
  Mail,
  Phone,
  Map,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Link2,
  Eye,
  Lock,
  Unlock,
};

interface IconRendererProps {
  iconName?: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders a Lucide React icon by name
 * Used to dynamically display icons stored as strings in the database
 */
export function IconRenderer({ iconName, className, fallback = '📁' }: IconRendererProps) {
  if (!iconName) {
    return <>{fallback}</>;
  }

  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    return <>{fallback}</>;
  }

  return <IconComponent className={className} />;
}
