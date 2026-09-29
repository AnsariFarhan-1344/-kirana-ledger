/**
 * Smart Reminder Generator for Kirana Ledger
 * Supports Hinglish, Hindi, and English with tone selection & WhatsApp deep-linking.
 */

export function generateReminderMessage({
  customerName,
  outstandingAmount,
  shopName = "Gupta Kirana Store",
  upiId = "guptakirana@okhdfcbank",
  language = "hinglish", // 'hinglish' | 'hindi' | 'english'
  tone = "polite", // 'polite' | 'gentle' | 'urgent'
}) {
  const formattedAmount = `₹${Math.round(outstandingAmount).toLocaleString("en-IN")}`;
  const firstName = customerName ? customerName.split(" ")[0] : "Bhai";

  const templates = {
    hinglish: {
      polite: `Namaste ${firstName} bhai, aapka ${shopName} par ${formattedAmount} ka baki hisaab hai. Jab convenient ho tab payment kar dena. Dhanyavaad 🙏\nUPI: ${upiId}`,
      gentle: `Hello ${firstName} ji, ek chhota sa reminder - aapka ${formattedAmount} ka udhaar baki hai. Aate jaate dukan par clear kar dena ji. Shukriya! 😊\nUPI: ${upiId}`,
      urgent: `Namaste ${firstName} bhai, aapka ${formattedAmount} ka purana hisaab kaafi time se pending hai. Kripya karke aaj hi payment clear kar dijiye. Dhanyavaad.\nPay UPI: ${upiId}`,
    },
    hindi: {
      polite: `नमस्ते ${firstName} जी, आपका ${shopName} पर ${formattedAmount} बाकी है। सुविधा अनुसार भुगतान कर दीजिए। धन्यवाद 🙏\nUPI: ${upiId}`,
      gentle: `नमस्ते ${firstName} जी, एक छोटा सा स्मरण - आपका ${formattedAmount} का हिसाब बाकी है। दुकान आते वक्त कृपया चुकता कर दें।\nUPI: ${upiId}`,
      urgent: `सादर प्रणाम ${firstName} जी, आपका ${formattedAmount} का पुराना उधार काफी समय से बकाया है। कृपया आज ही इसका भुगतान करने का कष्ट करें।\nUPI: ${upiId}`,
    },
    english: {
      polite: `Hi ${firstName}, your current outstanding balance at ${shopName} is ${formattedAmount}. Please make the payment when convenient. Thank you! 🙏\nUPI: ${upiId}`,
      gentle: `Hello ${firstName}, just a gentle reminder that your pending bill is ${formattedAmount}. You can clear it on your next visit or via UPI: ${upiId}. Have a great day!`,
      urgent: `Dear ${firstName}, your ledger balance of ${formattedAmount} is significantly overdue. Please settle this amount today at the earliest.\nUPI: ${upiId}`,
    },
  };

  const langTemplates = templates[language] || templates.hinglish;
  return langTemplates[tone] || langTemplates.polite;
}

/**
 * Creates WhatsApp deep-link URL for instant sharing with customer
 */
export function getWhatsAppUrl(phone, message) {
  if (!phone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  // Strip non-digits
  const cleanPhone = phone.replace(/[^\d]/g, "");
  // Ensure country code (default 91 for India if 10 digits)
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
