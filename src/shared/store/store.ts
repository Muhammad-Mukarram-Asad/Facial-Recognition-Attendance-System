import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth/store/authSlice';
import { departmentsReducer } from '@/features/departments/store/departmentsSlice';
import { designationsReducer } from '@/features/designations/store/designationsSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      departments: departmentsReducer,
      designations: designationsReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
