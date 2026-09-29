/**
 * Multi-lingual Reminder Templates (Framework-free TypeScript)
 * Supports Hinglish, Hindi, Marathi, and English with tone controls and WhatsApp links.
 */

export interface ReminderParams {
  customerName: string;
  outstandingAmount: number;
  shopName: string;
  upiId: string;
  language: "hinglish" | "hindi" | "marathi" | "english";
  tone: "soft" | "normal" | "firm";
}

export function generatePaymentReminder(params: ReminderParams): string {
  const { customerName, outstandingAmount, shopName, upiId, language, tone } = params;
  const firstName = customerName.split(" ")[0] || "Bhai";
  const formattedAmt = `₹${Math.round(outstandingAmount).toLocaleString("en-IN")}`;
  const upiLink = upiId ? `\nUPI Link: upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${outstandingAmount}&cu=INR` : "";

  const templates = {
    hinglish: {
      soft: `Hello ${firstName} ji! Ek chhota sa reminder - aapka ${shopName} par ${formattedAmt} ka hisaab hai. Agli baar aate waqt clear kar dena ji. Have a great day! 😊${upiLink}`,
      normal: `Namaste ${firstName} bhai, aapka ${shopName} par ${formattedAmt} ka baki amount hai. Jab convenient ho tab payment kar dena. Dhanyavaad! 🙏${upiLink}`,
      firm: `Namaste ${firstName} ji, aapka ${shopName} par ${formattedAmt} ka purana udhaar kafi samay se baki hai. Kripya karke aaj hi payment clear kar dijiye. Dhanyavaad.${upiLink}`,
    },
    hindi: {
      soft: `नमस्ते ${firstName} जी! एक छोटा सा स्मरण - आपका ${shopName} पर ${formattedAmt} का हिसाब बाकी है। दुकान आते वक्त सुविधा अनुसार चुका दें। धन्यवाद! 😊${upiLink}`,
      normal: `नमस्ते ${firstName} जी, आपका ${shopName} पर ${formattedAmt} बाकी है। सुविधा अनुसार भुगतान कर दीजिए। धन्यवाद 🙏${upiLink}`,
      firm: `सादर प्रणाम ${firstName} जी, आपका ${shopName} पर ${formattedAmt} का पुराना उधार काफी समय से बकाया है। कृपया आज ही भुगतान करने का कष्ट करें।${upiLink}`,
    },
    marathi: {
      soft: `नमस्कार ${firstName} जी, ${shopName} कडे आपले ${formattedAmt} बाकी आहेत. दुकानात आल्यावर सवडीने जमा करा. धन्यवाद! 😊${upiLink}`,
      normal: `नमस्कार ${firstName} भाऊ, ${shopName} कडे आपले ${formattedAmt} चे उधारीचे बाकी आहेत. कृपया सवडीनुसार पेमेंट करावे. धन्यवाद 🙏${upiLink}`,
      firm: `नमस्कार ${firstName} भाऊ, ${shopName} कडील आपले ${formattedAmt} चे उधारीचे बिल बरेच दिवस झाले प्रलंबित आहे. कृपया आजच रक्कम जमा करावी. धन्यवाद.${upiLink}`,
    },
    english: {
      soft: `Hi ${firstName}, gentle reminder from ${shopName} regarding your current balance of ${formattedAmt}. Please clear it at your convenience on your next visit! 😊${upiLink}`,
      normal: `Dear ${firstName}, your current outstanding balance at ${shopName} is ${formattedAmt}. Please arrange for the payment when convenient. Thank you! 🙏${upiLink}`,
      firm: `Dear ${firstName}, your account balance of ${formattedAmt} at ${shopName} is significantly overdue. Please settle this amount today. Thank you.${upiLink}`,
    },
  };

  const langObj = templates[language] || templates.hinglish;
  return langObj[tone] || langObj.normal;
}

export function buildWhatsAppLink(phone: string | undefined, message: string): string {
  if (!phone) return `https://wa.me/?text=${encodeURIComponent(message)}`;
  const cleanPhone = phone.replace(/[^\d]/g, "");
  const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}
