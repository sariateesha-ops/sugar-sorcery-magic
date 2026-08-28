import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCustomerProfile } from "@/lib/customer.functions";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

type SessionValue = {
  token: string | null;
  customer: Customer | null;
  orderCount: number;
  loading: boolean;
  signedIn: boolean;
  setSession: (token: string, customer: Customer) => void;
  setCustomer: (customer: Customer) => void;
  signOut: () => void;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = "sugar-sorcery-customer-token";

// Kept on globalThis so hot-reloads / duplicate module instances share one context.
const globalStore = globalThis as unknown as {
  __sugarSorceryCustomerContext?: React.Context<SessionValue | null>;
};
const SessionContext =
  globalStore.__sugarSorceryCustomerContext ??
  (globalStore.__sugarSorceryCustomerContext = createContext<SessionValue | null>(null));

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomerState] = useState<Customer | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (value: string | null) => {
    if (!value) {
      setCustomerState(null);
      setOrderCount(0);
      setLoading(false);
      return;
    }
    try {
      const res = await getCustomerProfile({ data: { token: value } });
      if (res) {
        setCustomerState(res.customer as Customer);
        setOrderCount(res.orderCount);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setCustomerState(null);
      }
    } catch {
      /* keep whatever we have; network hiccup */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setToken(stored);
    void load(stored);
  }, [load]);

  const value = useMemo<SessionValue>(
    () => ({
      token,
      customer,
      orderCount,
      loading,
      signedIn: Boolean(token && customer),
      setSession: (nextToken, nextCustomer) => {
        localStorage.setItem(STORAGE_KEY, nextToken);
        setToken(nextToken);
        setCustomerState(nextCustomer);
        setLoading(false);
      },
      setCustomer: (nextCustomer) => setCustomerState(nextCustomer),
      signOut: () => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setCustomerState(null);
        setOrderCount(0);
      },
      refresh: async () => {
        await load(token);
      },
    }),
    [token, customer, orderCount, loading, load],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useCustomer must be used inside CustomerProvider");
  return ctx;
}
