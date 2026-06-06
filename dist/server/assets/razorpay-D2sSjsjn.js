async function createRazorpayOrder(amountPaise, receipt) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return {
      id: `order_stub_${receipt.slice(0, 8)}`,
      amount: amountPaise,
      currency: "INR",
      status: "created"
    };
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order failed: ${err}`);
  }
  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency, status: data.status };
}
async function refundRazorpayPayment(paymentId, amountPaise) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return { id: `rfnd_stub_${paymentId.slice(0, 8)}`, status: "processed" };
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/payments/" + paymentId + "/refund", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(amountPaise ? { amount: amountPaise } : {})
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { id: data.id, status: data.status };
}
export {
  createRazorpayOrder as c,
  refundRazorpayPayment as r
};
