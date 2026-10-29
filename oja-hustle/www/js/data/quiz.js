// ============================================================
//  MARKET WISDOM QUIZ — asked at the end of each chapter.
//  chapter   = which chapter's quiz it belongs to
//  objective = which learning objective it tests:
//    1 Profit and loss   2 Budgeting   3 Supply and demand
//    4 Saving and interest   5 Debt traps and scams   6 Business vs personal money
//  c = index of the correct answer (0 = first)
// ============================================================

export const OBJECTIVES = [
  { id: 1, name: "Profit and loss", short: "Profit = revenue − cost" },
  { id: 2, name: "Budgeting", short: "Make and stick to a budget" },
  { id: 3, name: "Supply and demand", short: "How prices are set" },
  { id: 4, name: "Saving and interest", short: "Why saving grows money" },
  { id: 5, name: "Debt traps and scams", short: "Spot bad loans and fraud" },
  { id: 6, name: "Business vs personal money", short: "Keep them separate" },
];

export const QUIZ = [
  // Chapter 1
  { chapter: 1, objective: 1, q: "You bought 10 bags of pure water at ₦250 and sold all of them at ₦350. What is your profit?", a: ["₦3,500", "₦1,000", "₦2,500", "₦100"], c: 1, why: "Profit per bag is ₦350 − ₦250 = ₦100. Ten bags gives ₦1,000. ₦3,500 is your sales, not your profit." },
  { chapter: 1, objective: 1, q: "Sales were ₦15,000. Goods sold cost ₦11,000 and the levy was ₦300. What is the profit?", a: ["₦15,000", "₦4,000", "₦3,700", "₦11,300"], c: 2, why: "Profit = sales − all costs: ₦15,000 − ₦11,000 − ₦300 = ₦3,700." },
  { chapter: 1, objective: 2, q: "Bread spoils in 2 days. What is the smartest way to stock it?", a: ["Buy a lot so it's cheaper", "Buy only what you expect to sell", "Never sell bread", "Raise the price every day"], c: 1, why: "Unsold perishables become waste. Buying what you can sell protects your profit." },
  { chapter: 1, objective: 1, q: "Why does a trader keep a ledger (record book)?", a: ["To look busy", "To know if the business is making profit or loss", "Because the levy man asks for it", "To remember customers' names"], c: 1, why: "Without records you can't tell whether you are really making money." },
  { chapter: 1, objective: 6, q: "You owe a supplier and also want new shoes. What should come first?", a: ["The shoes", "Paying the business debt", "Borrowing more", "Closing the stall"], c: 1, why: "Business debts keep your supplier's trust. Personal spending can wait until the business is safe." },

  { chapter: 1, objective: 2, q: "An agbero collects ₦500 from you every day. How much is that in a 30-day month?", a: ["₦5,000", "₦15,000", "₦1,500", "₦50,000"], c: 1, why: "₦500 × 30 = ₦15,000. Small daily costs add up to big monthly costs, so count them in your budget." },

  // Chapter 2
  { chapter: 2, objective: 3, q: "Customers keep walking away saying 'Too cost!'. What should you try first?", a: ["Lower your price closer to the market price", "Buy more stock", "Close the stall", "Raise the price"], c: 0, why: "When your price is above what buyers will pay, demand drops. Move nearer the market price." },
  { chapter: 2, objective: 3, q: "Sugar's cost went up 20% today. A wise trader…", a: ["Keeps the old price and sells at a loss", "Raises the price a little and buys less", "Stops selling forever", "Borrows from a loan shark"], c: 1, why: "When costs rise, adjust your price and quantity so you don't sell at a loss." },
  { chapter: 2, objective: 3, q: "Chidi sells drinks cheaper than you across the walkway. What usually happens?", a: ["Customers still pay your higher price", "Customers buy drinks from Chidi", "Nothing changes", "Chidi goes out of business"], c: 1, why: "Competition limits what customers will pay. Your price must stay close to your rival's." },
  { chapter: 2, objective: 1, q: "In a haggle, what is the lowest price you should ever accept?", a: ["Anything the customer says", "Your cost price or above", "Half the market price", "₦0"], c: 1, why: "Selling below cost price means you lose money on that sale." },
  { chapter: 2, objective: 3, q: "It's festive season and many people want rice. What happens to rice prices?", a: ["They go up", "They go down", "They stay exactly the same", "Rice becomes free"], c: 0, why: "When demand rises and supply stays the same, prices tend to go up." },

  // Chapter 3
  { chapter: 3, objective: 4, q: "You save ₦10,000 and earn 2% a week. How much do you have after one week?", a: ["₦10,020", "₦10,200", "₦12,000", "₦10,002"], c: 1, why: "2% of ₦10,000 is ₦200, so you have ₦10,200." },
  { chapter: 3, objective: 2, q: "Which is a good budget for tonight's ₦10,000 profit?", a: ["Spend it all on fun", "Keep restock money, save some, spend a little", "Put everything in stock", "Lend it all to a friend"], c: 1, why: "A budget splits money between needs (restock), savings and small wants." },
  { chapter: 3, objective: 4, q: "Why put money in the bank instead of keeping cash at the stall?", a: ["It's safer from theft and it earns interest", "Banks always double your money", "Cash is illegal", "So you can't use it ever"], c: 0, why: "Banked money is protected and grows with interest." },
  { chapter: 3, objective: 2, q: "You want a ₦100,000 shop and save ₦5,000 a day. How many days will it take?", a: ["10 days", "20 days", "50 days", "5 days"], c: 1, why: "₦100,000 ÷ ₦5,000 = 20 days. Knowing this helps you plan." },
  { chapter: 3, objective: 6, q: "A friend asks to borrow from your restock money for a party. What's wise?", a: ["Give it all", "Say no — restock money keeps the business alive", "Close the shop for the party", "Use the savings jar instead"], c: 1, why: "Restock money is business money. Spending it stops tomorrow's sales." },

  { chapter: 3, objective: 2, q: "Market Union dues cost ₦1,500 a week and protect you from losses that could cost ₦10,000. This is most like…", a: ["Gambling", "Insurance", "A scam", "A loan"], c: 1, why: "Insurance means paying a small, planned amount to avoid a big, unexpected loss." },

  // Chapter 4
  { chapter: 4, objective: 5, q: "A loan of ₦20,000 must be paid back as ₦26,000 in 5 days. What is the interest?", a: ["6%", "13%", "30%", "26%"], c: 2, why: "₦6,000 extra on ₦20,000 is 30% in under a week. That is a very expensive loan." },
  { chapter: 4, objective: 5, q: "A message says: 'Send ₦5,000 now and get ₦50,000 tomorrow!' This is most likely…", a: ["A great investment", "A bank offer", "A scam", "A government grant"], c: 2, why: "Promises of huge, fast returns for a small payment are a classic scam." },
  { chapter: 4, objective: 5, q: "Someone claiming to be your bank asks for your PIN on the phone. You should…", a: ["Give it quickly", "Refuse and contact the bank yourself", "Give half of it", "Send them money"], c: 1, why: "Real banks never ask for your PIN. Hang up and call the bank's official number." },
  { chapter: 4, objective: 5, q: "Which loan is better for a business: 5% for 2 weeks or 30% for 5 days?", a: ["30% for 5 days", "5% for 2 weeks", "They're the same", "Neither ever"], c: 1, why: "Compare the cost: 5% over two weeks is far cheaper than 30% in five days." },
  { chapter: 4, objective: 6, q: "When is borrowing for your business a good idea?", a: ["To buy stock you are sure you can sell at a profit", "To pay for a party", "To pay back another loan shark", "Whenever someone offers"], c: 0, why: "Good debt helps you earn more than it costs. Bad debt pays for things that don't earn." },

  // Chapter 5
  { chapter: 5, objective: 1, q: "A staff member costs ₦2,500 a day and helps you sell ₦6,000 more profit. Is it worth it?", a: ["No, wages are always bad", "Yes, you gain ₦3,500 a day", "Only on Sundays", "You lose ₦6,000"], c: 1, why: "Extra profit ₦6,000 − wage ₦2,500 = ₦3,500 more each day." },
  { chapter: 5, objective: 2, q: "What does 'reinvest' mean?", a: ["Spend profit on yourself", "Put profit back into the business to grow it", "Hide money under the bed", "Pay a loan shark"], c: 1, why: "Reinvesting means using profit to buy things that help the business earn more." },
  { chapter: 5, objective: 3, q: "A school orders 10 bags of rice for delivery tomorrow. What must you do?", a: ["Nothing", "Make sure you buy enough rice in the morning", "Raise the price after accepting", "Cancel your other customers"], c: 1, why: "A delivery order is a promise. Plan your stock so you can keep it." },
  { chapter: 5, objective: 6, q: "Why should a business pay its owner a fixed amount instead of taking money anytime?", a: ["So the owner can't eat", "So the business can plan and track its real profit", "Because it's the law in every country", "It doesn't matter"], c: 1, why: "Taking random money hides how the business is really doing." },
  { chapter: 5, objective: 1, q: "Your sales went up but profit went down. What could explain it?", a: ["Costs grew faster than sales", "Sales and profit are the same thing", "Customers paid too much", "It is impossible"], c: 0, why: "More sales don't help if costs (stock, wages, waste) grow even faster." },

  // Chapter 6
  { chapter: 6, objective: 4, q: "What is compound interest?", a: ["Interest only on your first deposit", "Interest earned on your savings AND on past interest", "A bank fee", "A type of loan"], c: 1, why: "With compound interest, interest earns interest, so savings grow faster over time." },
  { chapter: 6, objective: 4, q: "₦100,000 at 2% a week. Roughly how much after 2 weeks with compounding?", a: ["₦102,000", "₦104,040", "₦120,000", "₦100,200"], c: 1, why: "Week 1: ₦102,000. Week 2: ₦102,000 × 1.02 = ₦104,040." },
  { chapter: 6, objective: 2, q: "What is a long-term plan?", a: ["Deciding what to eat tonight", "Setting a big goal and the steps to reach it over months", "Spending everything today", "Avoiding goals"], c: 1, why: "Long-term plans break a big goal (like a supermarket) into steps you can follow." },
  { chapter: 6, objective: 5, q: "Your business is doing well. A stranger offers to 'double your savings' in a week. You…", a: ["Send all your savings", "Walk away; it's a scam", "Send half", "Ask Femi"], c: 1, why: "Success attracts scammers. No honest investment doubles money in a week." },
  { chapter: 6, objective: 6, q: "Mama's lesson: which habit matters most for a lasting business?", a: ["Knowing your profit and saving regularly", "Never paying suppliers", "Borrowing as much as possible", "Copying your rival's prices exactly"], c: 0, why: "Knowing your numbers and saving consistently keep a business alive for years." },
];
