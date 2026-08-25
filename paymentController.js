const crypto = require('crypto');
const supabase = require('../config/db');

// Generate SHA-512 Hash required by Remita
const generateHash = (stringToHash) => {
  return crypto.createHash('sha512').update(stringToHash).digest('hex');
};

// 1. Initialize Fee Payment Transaction
const initiateRemitaPayment = async (req, res) => {
  try {
    const { student_id, amount, payer_name, payer_email, payer_phone } = req.body;

    if (!student_id || !amount || !payer_email) {
      return res.status(400).json({ error: "Student ID, amount, and payer email are required." });
    }

    const orderId = `TBHS-${Date.now()}`;
    const merchantId = process.env.REMITA_MERCHANT_ID;
    const serviceTypeId = process.env.REMITA_SERVICE_TYPE_ID;
    const apiKey = process.env.REMITA_API_KEY;

    // Remita Hash Formula: SHA512(merchantId + serviceTypeId + orderId + amount + apiKey)
    const rawHashString = `${merchantId}${serviceTypeId}${orderId}${amount}${apiKey}`;
    const apiHash = generateHash(rawHashString);

    // Save pending payment in Supabase
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        student_id,
        amount,
        reference: orderId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Payload sent back to client for Remita Inline Checkout
    res.status(200).json({
      message: "Payment initialized successfully.",
      paymentConfig: {
        merchantId,
        serviceTypeId,
        orderId,
        amount,
        apiHash,
        payerName: payer_name,
        payerEmail: payer_email,
        payerPhone: payer_phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error initiating Remita payment." });
  }
};

// 2. Verify Remita Payment (via RRR or Transaction Reference)
const verifyRemitaPayment = async (req, res) => {
  try {
    const { rrr, orderId, studentId } = req.body;

    const merchantId = process.env.REMITA_MERCHANT_ID;
    const apiKey = process.env.REMITA_API_KEY;

    // Remita Verification Hash: SHA512(rrr + apiKey + merchantId)
    const verificationHash = generateHash(`${rrr}${apiKey}${merchantId}`);

    const verifyUrl = `${process.env.REMITA_BASE_URL}/${merchantId}/${rrr}/${verificationHash}/status.reg`;

    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    // Remita Status "00" or "01" indicates Successful Transaction
    if (result.status === "00" || result.status === "01") {
      // Update payment record
      await supabase
        .from('payments')
        .update({ status: 'PAID' })
        .eq('reference', orderId);

      // Update student fee status to PAID
      await supabase
        .from('students')
        .update({ fee_status: 'PAID' })
        .eq('id', studentId);

      return res.status(200).json({ message: "Fee payment successful and verified!", remitaData: result });
    } else {
      return res.status(400).json({ error: "Payment verification failed or pending.", remitaData: result });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error verifying Remita payment." });
  }
};

module.exports = { initiateRemitaPayment, verifyRemitaPayment };