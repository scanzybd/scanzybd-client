import React, { useEffect } from "react";
import AOS from "aos";
import About from "../About/About";
import Banner from "../Banner/Banner";
import ProductShowcase from "../ProductShowcase/ProductShowcase";
import Reviews from "../Reviews/Reviews";

const Home = () => {
  useEffect(() => {
    // Refresh AOS bindings when Home mounts to ensure section animations trigger.
    AOS.refresh();
  }, []);

  return (
    <div>
      <div data-aos="fade-up" data-aos-duration="700">
        <Banner></Banner>
      </div>
      <div data-aos="fade-up" data-aos-delay="80" data-aos-duration="700">
        <ProductShowcase></ProductShowcase>
      </div>
      {/* <OfferShowcase></OfferShowcase> */}
      <div data-aos="fade-up" data-aos-delay="120" data-aos-duration="700">
        <About></About>
      </div>
      <div data-aos="fade-up" data-aos-delay="160" data-aos-duration="700">
        <Reviews></Reviews>
      </div>
    </div>
  );
};

export default Home;