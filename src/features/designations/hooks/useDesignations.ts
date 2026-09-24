import { useAppSelector } from '@/shared/store/hooks';

/** Reads the designations fetched once at sign-in (see authSlice/StoreProvider). */
export function useDesignations() {
  return useAppSelector((state) => state.designations);
}
