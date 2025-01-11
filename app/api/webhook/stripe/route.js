import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import {
  addPaidSubscriptionRecord,
  updateUserSubscriptionType,
  recoverFollowerData,
  cancelSubscription,
  backupUserFollowers,
} from "@/app/lib/db/db_functions";
import {
  sendSubscriptionCreatedEmail,
  sendUnsubscribeEmail,
} from "@/app/lib/email";
import { logger } from "@/app/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  logger.info(`stripe webhook invoked`);
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature");

  let data;
  let eventType;
  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        let user;
        const session = await stripe.checkout.sessions.retrieve(
          data.object.id,
          {
            expand: ["line_items"],
          }
        );
        const userId = session?.client_reference_id;
        const customerId = session?.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer?.email;

        //insert userId, customerId, customerEmail into subscription_checkout table - Create a Postgres SQL query to create a table with columns user_id, stripe_customer_id, customer_email, created_at, deleted_at columns. Also write the SQL query to insert into that table

        await addPaidSubscriptionRecord(userId, customerId, customerEmail);
        //update the users subscription type matching userId
        await updateUserSubscriptionType(userId, 1);

        //check if that user has data in backup_followers table
        await recoverFollowerData(userId);

        //send email to user notifying them that they've been subscribed to Pro
        const { success, message } = await sendSubscriptionCreatedEmail(
          customerEmail
        );

        break;
      }

      case "customer.subscription.deleted": {
        // ❌ Revoke access to the product
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        const subscription = await stripe.subscriptions.retrieve(
          data.object.id
        );
        const customerId = subscription.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer?.email;

        // Use the customerId to get the userId from the subscription_checkout table add a deleted date to the row
        const userId = await cancelSubscription(customerId);

        // Update the users subscription type
        if (userId) {
          await updateUserSubscriptionType(userId, 0);

          // Move the users followers to the backup followers table
          await backupUserFollowers(userId);

          await sendUnsubscribeEmail(customerEmail);
        }

        break;
      }

      default:
      // Unhandled event type
    }
  } catch (e) {
    logger.error("stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
