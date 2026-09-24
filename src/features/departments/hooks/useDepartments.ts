import { useAppSelector } from '@/shared/store/hooks';

/** Reads the departments fetched once at app bootstrap (see StoreProvider). */
export function useDepartments() {
  return useAppSelector((state) => state.departments);
}
