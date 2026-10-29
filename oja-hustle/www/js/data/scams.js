// ============================================================
//  SCAM OR LEGIT? — night messages from Chapter 4 onwards.
//  scam: true  = it's a scam (the player should tap "Scam")
//  scam: false = it's genuine (the player should tap "Legit")
// ============================================================

export const MESSAGES = [
  { from: "SMS · +234 813 ••• 4471", text: "CONGRATULATIONS! You have won ₦2,000,000 in the MTN Mega Promo. Send ₦15,000 processing fee to claim.", scam: true, why: "You can't win a promo you never entered, and real prizes never need a 'processing fee'." },
  { from: "WhatsApp · 'Bank Support'", text: "Dear customer, your account will be BLOCKED today. Reply with your card number and PIN to keep it active.", scam: true, why: "Banks never ask for your PIN or full card number by chat." },
  { from: "Mrs. Ada · Oja Ilu Bank", text: "Reminder: your savings earned interest this week. Visit the branch any time to see your statement.", scam: false, why: "This message asks for nothing and matches what really happens with your savings." },
  { from: "Unknown · 'Crypto King'", text: "Invest ₦50,000 today in my crypto scheme and get ₦100,000 by Friday. 100% guaranteed!!!", scam: true, why: "Guaranteed doubling in days is a classic Ponzi or investment scam." },
  { from: "Alhaji Musa", text: "Tobi, rice will be cheaper at my warehouse next week. Plan your stock. — Musa", scam: false, why: "Your real supplier sharing price news, and asking for nothing." },
  { from: "SMS · 'NEPA Refund'", text: "You are due a ₦45,000 electricity refund. Click bit.ly/nepa-refund-ng and enter your BVN to receive it.", scam: true, why: "Random links asking for your BVN are phishing. Government refunds don't arrive by strange links." },
  { from: "Chidi (rival trader)", text: "Market union meeting is on Saturday at 4pm by the main gate. Bring your levy card.", scam: false, why: "A normal market notice with no request for money or secrets." },
  { from: "WhatsApp · 'Your cousin'", text: "Hi, this is my new number. I'm stranded, please send ₦25,000 urgently, I'll pay back tomorrow.", scam: true, why: "'New number, urgent money' is a common impersonation scam. Call the person's old number first." },
  { from: "Customer · Mrs. Bisi", text: "Please keep 2 crates of eggs for me tomorrow morning, I'll pay when I come.", scam: false, why: "A normal customer request. No money is being taken from you." },
  { from: "SMS · 'Job Offer'", text: "You've been selected for a ₦300,000/month job abroad! Pay ₦40,000 for visa processing to this account.", scam: true, why: "Real employers don't ask you to pay to get a job." },
  { from: "Unknown · 'Loan App'", text: "Instant loan approved! ₦100,000 in 5 minutes. Install our app and allow access to all your contacts.", scam: true, why: "Shady loan apps harvest contacts and harass people. Only borrow from registered lenders." },
  { from: "Oja Ilu Market Association", text: "Market will be closed on Monday for environmental sanitation from 7am to 10am.", scam: false, why: "An ordinary public notice with nothing to pay." },
  { from: "SMS · 'Customs Auction'", text: "Seized generators selling for ₦20,000 only! Pay first, pick up at the port tomorrow.", scam: true, why: "Prices too good to be true plus 'pay first' is a fake auction scam." },
  { from: "Mrs. Ada · Oja Ilu Bank", text: "Your bank will never ask for your PIN, password or OTP. Report any such message to us.", scam: false, why: "A genuine safety reminder that asks you for nothing." },
];
