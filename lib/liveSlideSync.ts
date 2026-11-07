import { getSupabaseClient } from './supabaseClient';

export interface LiveSlideState {
  slideIndex: number;
  updatedAt: number;
  customImage?: string;
}

const CHANNEL_NAME = 'tcc-live-slides';
const STORAGE_KEY = 'JURIS_LIVE_SLIDE_STATE';

export function broadcastSlideChange(slideIndex: number, customImage?: string) {
  const payload: LiveSlideState = {
    slideIndex,
    updatedAt: Date.now(),
    customImage,
  };

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

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const channel = supabase.channel(CHANNEL_NAME);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'slide-change',
            payload,
          });
        }
      });
    } catch {
      // ignore realtime errors if offline
    }
  }
}

export function subscribeToSlideChanges(onUpdate: (state: LiveSlideState) => void): () => void {
  const cleanups: (() => void)[] = [];

  if (typeof window !== 'undefined') {
    // Load initial state from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LiveSlideState;
        if (typeof parsed?.slideIndex === 'number') {
          onUpdate(parsed);
        }
      }
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as LiveSlideState;
          onUpdate(parsed);
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
            onUpdate(ev.data as LiveSlideState);
          }
        };
        cleanups.push(() => bc.close());
      } catch {
        // ignore
      }
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const channel = supabase
        .channel(CHANNEL_NAME)
        .on('broadcast', { event: 'slide-change' }, ({ payload }) => {
          if (payload && typeof payload.slideIndex === 'number') {
            onUpdate(payload as LiveSlideState);
          }
        })
        .subscribe();

      cleanups.push(() => {
        supabase.removeChannel(channel);
      });
    } catch {
      // ignore
    }
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}

