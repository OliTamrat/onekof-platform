import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useAuth } from '../contexts/auth-context';

/**
 * Shows the user their connection + sync state.
 *
 * Visible states (in priority order):
 *   1. Syncing       — teal, spinner, "Syncing N changes..."
 *   2. Offline+queue — amber, cloud-upload icon, "N pending — tap to retry"
 *   3. Offline       — red, wifi-slash icon, "You're offline"
 *   4. Just synced   — green, check, "All changes synced" (auto-hides after 2.5s)
 *   5. Online, no queue — hidden (silent)
 */
export function OfflineBanner() {
  const { isOnline, isSyncing, offlineQueueCount, syncOfflineQueue } = useAuth();
  const insets = useSafeAreaInsets();
  const [showJustSynced, setShowJustSynced] = useState(false);
  const prevSyncing = useRef(false);
  const prevQueueCount = useRef(0);
  const opacity = useRef(new Animated.Value(0)).current;

  // Trigger "just synced" transient state: when syncing finishes AND queue drained to 0
  useEffect(() => {
    const finishedSyncing = prevSyncing.current && !isSyncing;
    const queueDrained = prevQueueCount.current > 0 && offlineQueueCount === 0;
    if (finishedSyncing && queueDrained && isOnline) {
      setShowJustSynced(true);
      const t = setTimeout(() => setShowJustSynced(false), 2500);
      return () => clearTimeout(t);
    }
    prevSyncing.current = isSyncing;
    prevQueueCount.current = offlineQueueCount;
  }, [isSyncing, offlineQueueCount, isOnline]);

  // Determine which visual state to show
  type BannerState = 'syncing' | 'offline-queue' | 'offline' | 'just-synced' | null;
  let state: BannerState = null;
  if (isSyncing) state = 'syncing';
  else if (!isOnline && offlineQueueCount > 0) state = 'offline-queue';
  else if (!isOnline) state = 'offline';
  else if (offlineQueueCount > 0) state = 'offline-queue'; // online with pending queue
  else if (showJustSynced) state = 'just-synced';

  // Fade in/out when state changes
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: state ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state, opacity]);

  if (!state) return null;

  const cfg = STATE_CONFIG[state];
  const Content = (
    <View style={[styles.banner, { backgroundColor: cfg.bg, paddingTop: Math.max(insets.top, 8) + 8 }]}>
      {state === 'syncing' ? (
        <ActivityIndicator size="small" color={cfg.color} />
      ) : (
        <FontAwesome name={cfg.icon as any} size={14} color={cfg.color} />
      )}
      <Text style={[styles.text, { color: cfg.color }]}>
        {typeof cfg.label === 'function' ? cfg.label(offlineQueueCount) : cfg.label}
      </Text>
    </View>
  );

  // Tappable only in offline-queue state (trigger manual retry)
  return (
    <Animated.View style={[styles.wrapper, { opacity, backgroundColor: cfg.bg }]}>
      {state === 'offline-queue' ? (
        <TouchableOpacity onPress={syncOfflineQueue} activeOpacity={0.85}>
          {Content}
        </TouchableOpacity>
      ) : (
        Content
      )}
    </Animated.View>
  );
}

/* Nocturne dark-theme banner colors.
 * Solid dark-tinted backgrounds (not rgba-over-nothing, which rendered
 * as light-pink over the iOS status bar area). Text is a light accent
 * of the same hue for high contrast without clashing with the app bg. */
const STATE_CONFIG: Record<
  'syncing' | 'offline-queue' | 'offline' | 'just-synced',
  { icon: string; color: string; bg: string; label: string | ((n: number) => string) }
> = {
  syncing: {
    icon: 'cloud-upload',
    color: '#5EEAD4', // teal-200
    bg: '#0F3A36',   // deep teal
    label: (n) => `Syncing ${n} change${n !== 1 ? 's' : ''}…`,
  },
  'offline-queue': {
    icon: 'cloud-upload',
    color: '#FCD34D', // amber-300
    bg: '#3B2A0A',   // deep amber
    label: (n) => `${n} pending change${n !== 1 ? 's' : ''} — tap to sync`,
  },
  offline: {
    icon: 'wifi',
    color: '#FCA5A5', // red-300
    bg: '#3B1414',   // deep red
    label: "You're offline — changes will sync when reconnected",
  },
  'just-synced': {
    icon: 'check-circle',
    color: '#86EFAC', // green-300
    bg: '#0F3A1E',   // deep green
    label: 'All changes synced',
  },
};

const styles = StyleSheet.create({
  /* Wrapper extends full-width with background color so it paints under the
     status bar / notch area cleanly, while inner banner content respects
     safe-area insets via paddingTop. */
  wrapper: {
    width: '100%',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
