import React from "react";
import About from "../About/About";
import Banner from "../Banner/Banner";
import ProductShowcase from "../ProductShowcase/ProductShowcase";
import Reviews from "../Reviews/Reviews";

const Home = () => {
  return (
    <div>
      <Banner></Banner>
      <ProductShowcase></ProductShowcase>
      {/* <OfferShowcase></OfferShowcase> */}
      <About></About>
      <Reviews></Reviews>
    </div>
  );
};

export default Home;