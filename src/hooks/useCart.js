import { useContext } from "react";
import CartContext from "../contexts/CartContext/CartContext.jsx";

const useCart = () => {
  return useContext(CartContext);
};

export default useCart;