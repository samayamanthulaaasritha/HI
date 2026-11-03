/**
 * Utility functions for generating professional WhatsApp notifications
 * and opening direct chats with partners and operators.
 */

export function cleanPhoneNumberForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // If 10 digits (standard Indian phone number without country code), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function generatePartnerCredentialsWhatsAppMessage(params: {
  businessName: string;
  managerName: string;
  email: string;
  password: string;
  loginUrl?: string;
}): string {
  const loginUrl = params.loginUrl || `${window.location.origin}/business/login`;

  return `🏨 *HotelInfo Platform - Business Account Credentials* 🏨

Dear *${params.managerName}*,

Congratulations! Your partner onboarding request for *${params.businessName}* on HotelInfo has been officially approved.

Here are your dedicated Business Portal credentials:
──────────────────────────────
🏢 *Property:* ${params.businessName}
👤 *Manager:* ${params.managerName}
📧 *Login Email:* ${params.email}
🔑 *Password:* ${params.password}
──────────────────────────────

🌐 *Login to your Business Dashboard:*
${loginUrl}

From your Business Dashboard, you can:
• Update real-time room availability & rates
• Add and edit categorized food & dining menu
• Upload property tour photos & media
• Direct arriving travelers directly to your place

If you need any guidance, our 24/7 partner support desk is ready to help.

Warm regards,
*HotelInfo Platform Administration*`;
}

export function openWhatsAppChat(phone: string, message: string): void {
  const cleanPhone = cleanPhoneNumberForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
