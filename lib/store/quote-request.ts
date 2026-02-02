import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuoteRequest } from '@/lib/types';

interface QuoteRequestState {
  draft: Partial<QuoteRequest>;
  step: number;
  setDraft: (updates: Partial<QuoteRequest>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState: Partial<QuoteRequest> = {
  type: 'umrah',
  season: 'flexible',
  totalNights: 10,
  nightsMakkah: 5,
  nightsMadinah: 5,
  hotelStars: 4,
  distancePreference: 'medium',
  occupancy: {
    single: 0,
    double: 2,
    triple: 0,
    quad: 0,
  },
  inclusions: {
    visa: true,
    flights: true,
    transfers: true,
    meals: true,
  },
  budgetRange: {
    min: 1000,
    max: 5000,
    currency: 'GBP',
  },
};

export const useQuoteRequestStore = create<QuoteRequestState>()(
  persist(
    (set) => ({
      draft: initialState,
      step: 1,
      setDraft: (updates) =>
        set((state) => ({ draft: { ...state.draft, ...updates } })),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      reset: () => set({ draft: initialState, step: 1 }),
    }),
    {
      name: 'quote-request-storage',
    }
  )
);
