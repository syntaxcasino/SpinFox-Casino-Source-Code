import Image from "next/image";
import React, { CSSProperties, useEffect, useState } from "react";

function ErrorableImage({
  url,
  alt = "",
  className,
  objectFit = "contain",
  placeholderUrl = "/images/spinfox.png",
}: {
  url: string;
  alt?: string;
  className?: string;
  objectFit?: CSSProperties["objectFit"];
  placeholderUrl?: string;
}) {
  const [validUrl, setValidUrl] = useState<string>(placeholderUrl);

  useEffect(() => {
    let isMounted = true;
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      if (isMounted) setValidUrl(url);
    };
    img.onerror = () => {
      if (isMounted) setValidUrl(placeholderUrl);
    };
    return () => {
      isMounted = false;
    };
  }, [url, placeholderUrl]);

  return (
    <Image
      className={className}
      src={validUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit }}
    />
  );
}

export default React.memo(ErrorableImage);
