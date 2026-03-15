// Payments are cash-only in this deployment.
// Razorpay-related endpoints are intentionally disabled.
// If you need to re-enable Razorpay, uncomment and configure the original logic.

import { sendResponse } from '../utils/apiResponse.js'

const message = 'Payments are cash-only. Razorpay payment features are disabled.'

export const createRazorpayOrder = async (req, res) => {
  return sendResponse(res, 403, null, message)
}

export const verifyPayment = async (req, res) => {
  return sendResponse(res, 403, null, message)
}

export const getPaymentDetails = async (req, res) => {
  return sendResponse(res, 403, null, message)
}

export const processRefund = async (req, res) => {
  return sendResponse(res, 403, null, message)
}

export const handleWebhook = async (req, res) => {
  // Webhook endpoint disabled; respond OK to avoid retries.
  res.status(200).json({ status: 'disabled', message })
}
