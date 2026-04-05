import React from "react";
import About from "../About/About";
import Banner from "../Banner/Banner";
import ProductShowcase from "../ProductShowcase/ProductShowcase";
import ProductPage from "../ProductDetails/ProductPage";
import OfferShowcase from "../OfferShowcase/OfferShowcase";
import Reviews from "../Reviews/Reviews";

const Home = () => {
  return (
   
    <div>
      <Banner></Banner>
      <About></About>
      <ProductPage></ProductPage>
      <ProductShowcase></ProductShowcase>
      <OfferShowcase></OfferShowcase>
      <Reviews></Reviews>
    </div>
  );
};

export default Home;