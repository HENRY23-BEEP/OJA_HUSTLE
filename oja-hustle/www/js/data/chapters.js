// ============================================================
//  STORY CHAPTERS
//  goal.type:
//    "debt"     — pay the wholesaler debt down to zero
//    "profit"   — earn this much total profit during the chapter
//    "stage"    — upgrade the business to this stage (1 = Shop, 2 = Mini-Mart, 3 = Supermarket)
//    "savingsScams" — reach savings AND spot scams AND owe Femi nothing
//    "stageStaff"   — reach a stage AND have at least this many staff
//  parDays = finish within this many days for a gold star
//  intro / outro = story scenes (who: "mama", "tobi", "musa", "ada", "femi", "chidi")
// ============================================================

export const CHAPTERS = [
  {
    id: 1, title: "The Old Ledger", lesson: "Profit and loss, record keeping",
    goal: { type: "debt", label: "Pay off Mama's ₦50,000 debt to Alhaji Musa" },
    parDays: 15,
    intro: [
      { who: "mama", text: "Tobi, my child. After 40 years in Oja Ilu market, my knees are tired. The stall is yours now." },
      { who: "mama", text: "But I must be honest. We owe Alhaji Musa ₦50,000 for goods, and the shelves are almost empty." },
      { who: "musa", text: "Your grandmother is a good woman. Pay me back small small, and I will keep selling to you." },
      { who: "mama", text: "Buy goods in the morning. Sell them for more than you paid. What is left is your profit. Use it to clear the debt." },
      { who: "mama", text: "And watch out for the agberos. They will come asking for 'settlement'. If you pay every time, they will keep coming back." },
    ],
    outro: [
      { who: "musa", text: "Paid in full! Ronke's grandchild has a good head for business." },
      { who: "mama", text: "I am proud of you. But the market does not sleep. Prices are about to start dancing..." },
    ],
  },
  {
    id: 2, title: "Price Wahala", lesson: "Supply and demand, pricing",
    goal: { type: "profit", target: 50000, label: "Make ₦50,000 profit while prices go up and down" },
    parDays: 8,
    intro: [
      { who: "musa", text: "Bad news, Tobi. Fuel price went up, so transport costs went up. My prices will change every day now." },
      { who: "chidi", text: "Hello neighbour! I'm Chidi. My stall is just across the walkway. Let's see who sells more." },
      { who: "mama", text: "When your cost goes up, your price must follow. But if you go too high, customers will buy from Chidi." },
      { who: "mama", text: "Watch the warehouse prices every morning. Some customers will also pay with big notes, so count your change well." },
      { who: "chidi", text: "Tip from your neighbour: spreading goods on the walkway brings more customers. Just run when the Task Force van comes! And watch for boys in hoodies... Ole dey market." },
    ],
    outro: [
      { who: "chidi", text: "Hmm. You handled that price wahala better than me. Respect." },
      { who: "mama", text: "Well done. Now I have new goods for you: milk and cooking oil. And a new dream: a real shop." },
    ],
  },
  {
    id: 3, title: "Small Small", lesson: "Budgeting and saving",
    goal: { type: "stage", target: 1, label: "Save ₦100,000 and upgrade to a Shop" },
    parDays: 8,
    intro: [
      { who: "mama", text: "A shop with walls, a door and a freezer! It costs ₦100,000. That is a lot of money." },
      { who: "ada", text: "I'm Mrs. Ada from the bank. Put money in your savings jar every night. It earns 2% interest every week." },
      { who: "mama", text: "And don't keep too much cash at the stall overnight. Thieves know who has money." },
      { who: "mama", text: "Small small, the jar fills. When savings reach ₦100,000, go to Grow and buy the shop." },
    ],
    outro: [
      { who: "ada", text: "Congratulations on your new shop! Your savings history also makes you eligible for a bank loan." },
      { who: "mama", text: "A real shop! But bigger business attracts bigger temptations. Be careful who you trust." },
    ],
  },
  {
    id: 4, title: "The Fast Money Man", lesson: "Debt traps and scams",
    goal: { type: "savingsScams", savings: 120000, scams: 4, label: "Save ₦120,000, spot 4 scams, and owe Femi nothing" },
    parDays: 16,
    intro: [
      { who: "femi", text: "Ah, the new shop owner! Why wait to grow small small? I can give you cash today. Fast money!" },
      { who: "mama", text: "That is Fast Money Femi. His loans cost 30% in five days. The bank charges 5% for two weeks." },
      { who: "mama", text: "You will also get strange messages. Some are real, many are scams. Read them carefully before you trust them." },
      { who: "ada", text: "Remember: a real bank will never ask for your PIN, and no real investment doubles your money overnight." },
    ],
    outro: [
      { who: "femi", text: "You no dey take my loan, you no dey fall for my friends' messages... Okay o, I'll find another customer." },
      { who: "mama", text: "You are wiser than many grown traders. Now it is time to grow. You cannot do everything alone." },
    ],
  },
  {
    id: 5, title: "Growing Up", lesson: "Reinvestment and business growth",
    goal: { type: "stageStaff", target: 2, staff: 1, label: "Hire staff and upgrade to a Mini-Mart (₦400,000)" },
    parDays: 20,
    intro: [
      { who: "mama", text: "Your queue is getting long, my child. Customers walk away when they wait too long." },
      { who: "mama", text: "Hire a shop assistant from Grow. Staff cost a daily wage, but they serve customers while you serve others." },
      { who: "musa", text: "A Mini-Mart costs ₦400,000. Then schools and offices will send you big delivery orders." },
      { who: "mama", text: "Reinvest your profit. Every naira you put back into the business can bring more naira tomorrow." },
    ],
    outro: [
      { who: "ada", text: "A Mini-Mart with POS payments and staff! Your savings history is excellent." },
      { who: "mama", text: "One last dream, Tobi. A supermarket with my name on it. Let us see it before these old eyes close." },
    ],
  },
  {
    id: 6, title: "Mama's Supermarket", lesson: "Long-term planning and compound interest",
    goal: { type: "stage", target: 3, label: "Save ₦1,500,000 and open Mama Ronke's Supermarket" },
    parDays: 30,
    intro: [
      { who: "mama", text: "₦1,500,000. It sounds impossible. But you started with an empty stall and a ₦50,000 debt." },
      { who: "ada", text: "Big savings earn big interest. Interest on top of interest is called compound interest. Let it work for you." },
      { who: "mama", text: "Keep your staff busy, take good delivery orders, and save every week. Plan for the long road." },
    ],
    outro: [
      { who: "mama", text: "Mama Ronke's Supermarket... Tobi, I am crying. Come, help me cut the ribbon." },
      { who: "musa", text: "From an empty stall to a supermarket! The whole of Oja Ilu is talking about you." },
      { who: "mama", text: "Remember everything you learned: know your profit, save small small, avoid fast money, and never stop learning." },
    ],
  },
];
