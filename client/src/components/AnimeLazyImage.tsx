import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { cn } from '@/lib/utils';

interface AnimeLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  placeholderSrc?: string;
  onError?: () => void;
  onClick?: () => void;
}

const AnimeLazyImage = ({
  src,
  alt,
  className,
  wrapperClassName,
  placeholderSrc,
  onError,
  onClick,
}: AnimeLazyImageProps) => {
  // Default placeholder that resembles anime silhouette
  const defaultPlaceholder = '/images/placeholder.webp';

  return (
    <div className={cn('overflow-hidden', wrapperClassName)}>
      <LazyLoadImage
        alt={alt}
        src={src}
        effect="blur"
        placeholderSrc={placeholderSrc || defaultPlaceholder}
        className={cn('object-cover transition-all duration-500 w-full h-full', className)}
        onError={onError}
        onClick={onClick}
        wrapperClassName="w-full h-full"
        threshold={300}
      />
    </div>
  );
};

export default AnimeLazyImage;