import { useState, type ImgHTMLAttributes } from "react";
import { RAYO_LOGO_IMAGE } from "../../lib/menu/utils";

interface ProductImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  hasRealImage: boolean;
  logoClassName?: string;
}

const ProductImage = ({
  src,
  hasRealImage,
  className = "",
  logoClassName = "p-12",
  decoding = "async",
  onError,
  ...props
}: ProductImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showLogo = !hasRealImage || failedSrc === src;

  return (
    <img
      {...props}
      decoding={decoding}
      src={showLogo ? RAYO_LOGO_IMAGE : src}
      className={`${className} ${
        showLogo ? `object-contain ${logoClassName}` : "object-cover object-center"
      }`.trim()}
      onError={(event) => {
        if (!showLogo) {
          event.currentTarget.onerror = null;
          setFailedSrc(src);
          event.currentTarget.src = RAYO_LOGO_IMAGE;
        } else {
          event.currentTarget.onerror = null;
        }
        onError?.(event);
      }}
    />
  );
};

export default ProductImage;
