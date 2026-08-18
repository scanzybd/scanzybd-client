import React, { useEffect, useRef } from 'react';
import bannerImage from '../../../assets/banner/Banner.png';
import { BANNER_VIDEO_URL, BRAND_YELLOW, BRAND_FULL, COMPANY_TAGLINE } from '../../../config/company';

const Banner = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React often omits the `muted` DOM attribute; browsers block unmuted autoplay.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay);
    return () => video.removeEventListener('loadeddata', tryPlay);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden sm:h-[calc(100vh-70px)]"
      style={{ backgroundColor: BRAND_YELLOW }}
      aria-label={`${BRAND_FULL} hero banner`}
    >
      <h1 className="sr-only">
        {BRAND_FULL} — {COMPANY_TAGLINE}
      </h1>
      <video
        ref={videoRef}
        src={BANNER_VIDEO_URL}
        autoPlay
        muted
        defaultMuted
        loop
        playsInline
        preload="auto"
        poster={bannerImage}
        className="h-full w-full object-contain"
      />
    </section>
  );
};

export default Banner;
