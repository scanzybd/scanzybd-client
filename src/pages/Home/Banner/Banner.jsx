import React from 'react';
import bannerVideo from '../../../assets/banner/BannerVideo.mp4';
import bannerImage from '../../../assets/banner/Banner.png';

const Banner = () => {
  return (
    <div className="relative  w-full overflow-hidden bg-yellow-400 sm:h-[calc(100vh-70px)]">
      <video
        src={bannerVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={bannerImage} // 👈 এইটাই main
        className="mx-auto block h-full w-fit sm:w-full object-cover"
      />
    </div>
  );
};

export default Banner;