import React from 'react';
import bannerVideo from '../../../assets/banner/BannerVideo.mp4';
import bannerImage from '../../../assets/banner/Banner.png';
import { BRAND_YELLOW } from '../../../config/company';

const Banner = () => {
  return (
    <div
      className="relative w-full overflow-hidden sm:h-[calc(100vh-70px)]"
      style={{ backgroundColor: BRAND_YELLOW }}
    >
      <video
        src={bannerVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={bannerImage}
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export default Banner;