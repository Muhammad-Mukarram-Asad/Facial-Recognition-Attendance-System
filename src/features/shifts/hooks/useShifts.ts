import { useAppSelector } from '@/shared/store/hooks';

/** Reads the shifts fetched once at sign-in (see useSignIn and StoreProvider). */
export function useShifts() {
  return useAppSelector((state) => state.shifts);
}
