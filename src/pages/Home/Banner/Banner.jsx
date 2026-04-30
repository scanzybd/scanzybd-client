import React from 'react';
import bannerVideo from '../../../assets/banner/BannerVideo.mp4';
import bannerImage from '../../../assets/banner/Banner.png';

const Banner = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <video
        src={bannerVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={bannerImage} // 👈 এইটাই main
        className="block w-full h-auto"
      />
    </div>
  );
};

export default Banner;