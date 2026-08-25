import razorpay from '../config/razorpay.js';

/**
 * Creates a Razorpay payment link for a given product.
 * @param {Object} product - The product object from the catalog
 * @returns {Object} Success response with paymentLink or error
 */
export async function createPaymentLink(product) {
  try {
    const paymentLinkReq = {
      amount: product.price * 100, // Amount in paise
      currency: "INR",
      accept_partial: false,
      description: `Purchase of ${product.name}`,
      customer: {
        name: "Valued Customer",
        email: "customer@example.com",
        contact: "+919876543210"
      },
      notify: { sms: false, email: false },
      reminder_enable: false,
      notes: { productId: product.id }
    };

    const link = await razorpay.paymentLink.create(paymentLinkReq);
    return {
      success: true,
      paymentLink: link.short_url,
      message: `Successfully generated payment link for ${product.name}. Please provide this exact link to the user.`
    };
  } catch (error) {
    console.error("[Payment Service] Razorpay Error:", error);
    return { error: "Failed to generate payment link due to a payment gateway error. Apologize to the user." };
  }
}
