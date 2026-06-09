import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "vandrouka:session";

type SessionData = {
  userId: string;
  email: string;
  token: string;
};

type Listener = (data: SessionData | null) => void;

let _state: SessionData | null = null;
let _hydrated = false;
const _listeners = new Set<Listener>();

function emit() {
  for (const listener of _listeners) listener(_state);
}

async function persist() {
  if (_state) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export const session = {
  async hydrate(): Promise<boolean> {
    if (_hydrated) return _state !== null;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionData;
        if (parsed?.userId && parsed?.token) {
          _state = parsed;
        }
      }
    } catch {
      _state = null;
    } finally {
      _hydrated = true;
      emit();
    }
    return _state !== null;
  },

  set(id: string, email: string, token: string) {
    _state = { userId: id, email, token };
    _hydrated = true;
    void persist();
    emit();
  },

  getUserId(): string | null {
    return _state?.userId ?? null;
  },

  getEmail(): string | null {
    return _state?.email ?? null;
  },

  getToken(): string | null {
    return _state?.token ?? null;
  },

  isAuthenticated(): boolean {
    return _state !== null;
  },

  isHydrated(): boolean {
    return _hydrated;
  },

  async clear() {
    _state = null;
    await persist();
    emit();
  },

  subscribe(listener: Listener): () => void {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },
};
