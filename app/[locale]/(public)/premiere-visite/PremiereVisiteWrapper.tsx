'use client';

import { PremiereVisite } from '@/app/pages/PremiereVisite';
import { useRouter } from '@/i18n/routing';

export function PremiereVisiteWrapper() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === 'accueil') {
      router.push('/');
    } else {
      router.push(`/${page}`);
    }
  };

  return <PremiereVisite onNavigate={handleNavigate} />;
}
