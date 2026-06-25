'use client';
import { useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  return null;
  const t = useTranslations('footer');
  return (
    <div className="text-center mt-8 text-content-muted text-sm">
      {t('text')} © {new Date().getFullYear()}
    </div>
  );
};

export default Footer;
