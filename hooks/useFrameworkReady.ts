import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization logic for Expo Router
    console.log('Framework ready for standalone build');
  }, []);
}