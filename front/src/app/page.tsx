"use client";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

const stripePromise = loadStripe(
  "pk_test_51P67i7GTOlFbdaNkmSTPOzsKqCduRdurv3vbGswvkmmwRgRvRqXzMdaBcwGtH6flyOcdrduu2WrIoboMczyFKzE700tQhxGUMM"
);

const CheckoutForm = () => {
  const [clientSecret, setClientSecret] = useState();

  useEffect(() => {
    fetch("http://localhost:3066/create-checkout-session", {
      method: "POST",
      body: "{}",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setClientSecret(data.clientSecret);
        return data.clientSecret;
      });
  }, []);
  return (
    <div className="">
      <h1>Embeded form</h1>
      {clientSecret && (
        <div id="checkout" className=" border">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
