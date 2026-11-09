import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

export interface LiveSlideState {
  slideIndex: number;
  updatedAt: number;
  customImage?: string;
}

const CHANNEL_NAME = 'tcc-live-slides';
const STORAGE_KEY = 'JURIS_LIVE_SLIDE_STATE';

export const PUBLIC_PRODUCTION_ORIGIN = 'https://jurismentor-tcc-iptu.vercel.app';

export function getPublicAudienceUrl(): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_PRODUCTION_ORIGIN}/telao?plateia=1`;
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
    return `${PUBLIC_PRODUCTION_ORIGIN}/telao?plateia=1`;
  }
  return `${window.location.origin}/telao?plateia=1`;
}

type SlideListener = (state: LiveSlideState) => void;
type StatusListener = (connected: boolean, viewerCount: number) => void;

const slideListeners = new Set<SlideListener>();
const statusListeners = new Set<StatusListener>();

let sharedChannel: RealtimeChannel | null = null;
let isChannelSubscribed = false;
let currentViewerCount = 1;
let pendingBroadcast: LiveSlideState | null = null;
let latestKnownState: LiveSlideState | null = null;

function notifySlideListeners(state: LiveSlideState) {
  latestKnownState = state;
  slideListeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // ignore listener error
    }
  });
}

function notifyStatusListeners() {
  statusListeners.forEach((fn) => {
    try {
      fn(isChannelSubscribed, currentViewerCount);
    } catch {
      // ignore
    }
  });
}

function updatePresenceCount(channel: RealtimeChannel) {
  try {
    const state = channel.presenceState();
    const count = Object.keys(state).length;
    currentViewerCount = Math.max(1, count);
    notifyStatusListeners();
  } catch {
    // ignore
  }
}

function ensureRealtimeChannel(): RealtimeChannel | null {
  if (typeof window === 'undefined') return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  if (sharedChannel) {
    return sharedChannel;
  }

  const clientKey = `viewer-${Math.random().toString(36).slice(2, 10)}`;

  const channel = supabase.channel(CHANNEL_NAME, {
    config: {
      broadcast: { self: false, ack: true },
      presence: { key: clientKey },
    },
  });

  channel
    .on('broadcast', { event: 'slide-change' }, ({ payload }) => {
      if (payload && typeof payload.slideIndex === 'number') {
        const state = payload as LiveSlideState;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
          // ignore
        }
        notifySlideListeners(state);
      }
    })
    .on('broadcast', { event: 'request-current-slide' }, () => {
      // Se um colega do grupo acabou de abrir o link no celular e pediu o slide atual,
      // responde com o último estado conhecido
      const stateToSend = latestKnownState || getSavedLocalState();
      if (stateToSend && isChannelSubscribed && sharedChannel) {
        sharedChannel
          .send({
            type: 'broadcast',
            event: 'slide-change',
            payload: stateToSend,
          })
          .catch(() => {});
      }
    })
    .on('presence', { event: 'sync' }, () => {
      updatePresenceCount(channel);
    })
    .on('presence', { event: 'join' }, () => {
      updatePresenceCount(channel);
    })
    .on('presence', { event: 'leave' }, () => {
      updatePresenceCount(channel);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        isChannelSubscribed = true;
        notifyStatusListeners();

        channel.track({ online_at: new Date().toISOString() }).catch(() => {});

        // Se havia um envio pendente antes de terminar de conectar, envia agora
        if (pendingBroadcast) {
          const toSend = pendingBroadcast;
          pendingBroadcast = null;
          channel
            .send({
              type: 'broadcast',
              event: 'slide-change',
              payload: toSend,
            })
            .catch(() => {});
        } else {
          // Pede para o apresentador informar em qual slide está neste momento
          channel
            .send({
              type: 'broadcast',
              event: 'request-current-slide',
              payload: { requestedAt: Date.now() },
            })
            .catch(() => {});
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        isChannelSubscribed = false;
        notifyStatusListeners();
      }
    });

  sharedChannel = channel;
  return channel;
}

function getSavedLocalState(): LiveSlideState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LiveSlideState;
      if (typeof parsed?.slideIndex === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function broadcastSlideChange(slideIndex: number, customImage?: string) {
  const payload: LiveSlideState = {
    slideIndex,
    updatedAt: Date.now(),
    customImage,
  };

  latestKnownState = payload;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }

    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage(payload);
        bc.close();
      } catch {
        // ignore BroadcastChannel errors
      }
    }
  }

  const channel = ensureRealtimeChannel();
  if (channel) {
    if (isChannelSubscribed) {
      channel
        .send({
          type: 'broadcast',
          event: 'slide-change',
          payload,
        })
        .catch(() => {});
    } else {
      pendingBroadcast = payload;
    }
  }
}

export function subscribeToSlideChanges(
  onUpdate: (state: LiveSlideState) => void,
  onStatusChange?: (connected: boolean, viewerCount: number) => void
): () => void {
  const cleanups: (() => void)[] = [];

  slideListeners.add(onUpdate);
  cleanups.push(() => slideListeners.delete(onUpdate));

  if (onStatusChange) {
    statusListeners.add(onStatusChange);
    onStatusChange(isChannelSubscribed, currentViewerCount);
    cleanups.push(() => statusListeners.delete(onStatusChange));
  }

  if (typeof window !== 'undefined') {
    const initial = getSavedLocalState();
    if (initial) {
      latestKnownState = initial;
      onUpdate(initial);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as LiveSlideState;
          if (typeof parsed?.slideIndex === 'number') {
            latestKnownState = parsed;
            onUpdate(parsed);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    cleanups.push(() => window.removeEventListener('storage', onStorage));

    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.onmessage = (ev) => {
          if (ev?.data && typeof ev.data.slideIndex === 'number') {
            const state = ev.data as LiveSlideState;
            latestKnownState = state;
            onUpdate(state);
          }
        };
        cleanups.push(() => bc.close());
      } catch {
        // ignore
      }
    }

    ensureRealtimeChannel();
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
