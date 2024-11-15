import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  stripe!: Stripe;
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/create-checkout-session')
  @Redirect()
  async createCheckoutSession() {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'aud',
            unit_amount: 100 * 10.55, // in cent 10.55 aud into cent
            product_data: {
              name: 'Visa A',
              images: [
                'https://images.unsplash.com/photo-1499852848443-3004d6dc4cfc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              ],
            },
          },
          quantity: 2,
        },
      ],
      currency: 'AUD',
      ui_mode: 'hosted',
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    return { url: session.url };
  }

  @Post('/create-checkout-session')
  async createCheckoutSessionPost() {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'aud',
            unit_amount: 100 * 10.55, // in cent 10.55 aud into cent
            product_data: {
              name: 'Visa A',
              images: [
                'https://images.unsplash.com/photo-1499852848443-3004d6dc4cfc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              ],
            },
          },
          quantity: 2,
        },
      ],
      currency: 'AUD',
      ui_mode: 'embedded',
      mode: 'payment',
      return_url: 'http://localhost:3000/success',
      // cancel_url: 'http://localhost:3000/cancel',
    });
    console.log(session.client_secret);
    return { clientSecret: session.client_secret };
  }

  @Post('/webhook')
  async webHook(@Req() req: RawBodyRequest<Request>, @Body() body: any) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = this.configService.get('STRIPE_ENDPOINT_SECRET');

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw `Webhook Error: ${err.message}`;
    }
    console.log('🚀 ~ AppController ~ webHook ~ sig:', sig);
    console.log(event);
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(
          '🚀 ~ AppController ~ webHook ~ paymentIntent:',
          paymentIntent,
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // console.log(
        //   '🚀 ~ AppController ~ webHook ~ paymentMethod:',
        //   paymentMethod,
        // );
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return { received: true };
  }
}
