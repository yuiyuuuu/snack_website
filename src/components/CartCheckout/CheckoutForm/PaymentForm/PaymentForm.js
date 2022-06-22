import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { Elements, CardElement, PaymentElement } from "@stripe/react-stripe-js";

import { Payment } from "@material-ui/icons";
import useStyles from "./styles";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  _createOrderDetail,
  _createOrderItem,
  _updateProductQuantity,
  _deleteCartItem,
  _deleteShoppingSession,
  _createshoppingSession,
} from "../../../../store/checkout";
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ backstep, nextstep }) => {
  const classes = useStyles();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const cart = useSelector((state) => state.cartReducer);
  const user = useSelector((state) => state.auth);

  let total;
  if (cart.length !== 0) {
    total = cart
      .map((item) => item.quantity * Number(item.product.price))
      .reduce((prev, curr) => prev + curr)
      .toFixed(2);
  }

  const handleCheckout = async () => {
    // create new order detail
    const detailTotal = { userId: user.id, total: Number(total) };
    await dispatch(_createOrderDetail(detailTotal));

    // create new order items
    await cart.map((item) => {
      const obj = {
        itemId: item.product.id,
        userId: user.id,
        quantity: item.quantity,
      };
      return dispatch(_createOrderItem(obj));
    });

    // update product quantities
    await cart.map((item) => {
      let { product } = item;
      const currentQty = product.quantity;
      const updatedQty = currentQty - item.quantity;
      product = { ...product, quantity: updatedQty };
      return dispatch(_updateProductQuantity(product));
    });

    // delete cart item
    await cart.map((item) => {
      return dispatch(_deleteCartItem(item.id));
    });

    // delete shopping session
    await dispatch(_deleteShoppingSession(cart[0].shoppingSessionId));

    // // create shopping session
    await dispatch(_createshoppingSession(user.id));

    nextstep();

    // setTimeout(function () {
    //   window.location.replace("/");
    // }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (!error) {
      try {
        const { id } = paymentMethod;
        fetch("/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.REACT_APP_STRIPE_SECRET_KEY,
          },
          body: JSON.stringify({ id: id }),
        })
          .then(setIsProcessing(true))
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            if (data.success) {
              handleCheckout();
              nextstep();
              setIsProcessing(false);
            }
          });
      } catch (error) {
        console.log("Error", error);
      }
    } else {
      console.log(error.message);
    }
  };

  return (
    <>
      {!isProcessing ? (
        <Card>
          <CardContent>
            <Payment />
            <Typography className={classes.title}>
              Payment Information
            </Typography>

            <div style={{ padding: "20px" }}>
              <form onSubmit={handleSubmit}>
                <CardElement id='cardElement' />

                <br />
                <br />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button variant='outlined' onClick={() => backstep()}>
                    Back
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={!stripe || !elements || isLoading}
                    color='primary'
                  >
                    Pay
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div style={{ margin: "15px" }}>
            <Typography variant='h5'>
              Your order is being processed, please wait
            </Typography>
          </div>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </div>
        </>
      )}
    </>
  );
};

export default PaymentForm;

{
  /* <>
  <div style={{ margin: "15px" }}>
    <Typography variant='h5'>
      Your order is being processed, please wait
    </Typography>
  </div>
  <br />
  <div className={classes.spinner}>
    <CircularProgress />
  </div>
</>; */
}

/* <ElementsConsumer>
              {({ elements, stripe }) => {
              }}
              </ElementsConsumer>
              */
