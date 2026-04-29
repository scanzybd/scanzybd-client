import React from 'react';
import bannerVideo from '../../../assets/banner/BannerVideo.mp4';
import { useTranslation } from "react-i18next";

const Banner = () => {
    useTranslation();

    return (
        <div className="relative w-full overflow-hidden">
            <video
                src={bannerVideo}
                autoPlay
                muted
                loop
                playsInline
                className="block w-full h-auto"
            />
        </div>
    );
};

export default Banner;