# Oja Hustle

**Learn money. Run the market.**

Oja Hustle is an educational business game. You play as Tobi, who takes over Mama Ronke's struggling provisions stall in Oja Ilu market and grows it into a supermarket. Along the way you learn profit and loss, budgeting, supply and demand, saving and interest, and how to avoid debt traps and scams.

- 6 story chapters, from a wooden stall to Mama Ronke's Supermarket, then free play
- Real-time market days: serve customers, haggle, give the right change, rush-restock
- Night events: Fast Money Femi's loans, scam-or-legit messages, stock counts, delivery orders, thieves
- **Street life:** agberos demanding "settlement" (pay, beg, refuse, call the Market Union, or fight in a cartoon street-fight mini-game), hoodie thieves you must spot or chase ("OLE! OLE!"), Task Force raids when you spread goods on the walkway, and a Street Respect stat. Can be switched off in Menu.
- Bank with savings interest and loans; hire staff; 4 business sizes; 15 products
- Market Wisdom quiz after each chapter, plus a Progress Report of what the player has learned
- Works **offline**, saves progress on the device, and runs on **Android, iOS and the web** from one codebase

---

## What's in this folder

| Folder / file | What it is |
|---|---|
| `www/` | **The whole game.** This is all that's needed to play it. |
| `www/js/data/` | **Game content you can edit**: products, prices, chapters, quiz, scams, balance settings |
| `www/js/engine/game.js` | The game rules (money, customers, loans, chapters) |
| `www/js/ui/` | The screens, the market day, pictures and sounds |
| `www/css/style.css` | Colours and layout |
| `assets/` | App icon and splash screen used for Android and iOS |
| `tests/simulate.mjs` | A bot that plays the whole game to check the balance |
| `tools/` | Small helpers: local test server and the single-file builder |
| `.github/workflows/` | Automatic builds: the website and the Android app |
| `capacitor.config.json` | Settings for the Android/iOS app (name, app ID) |

---

## 1. Try it on your computer

**Quickest:** open `dist/oja-hustle-standalone.html` in Chrome. It's the whole game in one file.

**While editing:** install [Node.js](https://nodejs.org) (version 20 or newer), then in this folder run:

```bash
npm start
```

Open **http://localhost:8080**. Add `?fast` to the address (`http://localhost:8080/?fast`) to make market days 15 seconds long while you test.

> Opening `www/index.html` directly by double-clicking won't work, because browsers block game modules loaded from your disk. Use `npm start` or the standalone file.

---

## 2. Put it online (free, with GitHub)

You get a link like **https://your-username.github.io/oja-hustle/** that anyone can open on any phone. After the first visit it keeps working offline, and players can install it like an app (Chrome: **⋮ → Add to Home screen**; iPhone Safari: **Share → Add to Home Screen**).

1. Create a free account at **github.com**.
2. Create a new **public** repository called `oja-hustle`.
3. Upload this whole folder to it. Make sure the `.github` folder is included, because it's hidden on some computers. The easiest way:
   - Install **GitHub Desktop**, choose *File → Add local repository*, pick this folder, then click **Publish repository** (untick "Keep this code private").
   - Or with git:
     ```bash
     git init
     git add .
     git commit -m "Oja Hustle v1.0"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/oja-hustle.git
     git push -u origin main
     ```
4. On GitHub, open your repository → **Settings → Pages**, and set **Source** to **GitHub Actions**.
5. Open the **Actions** tab. When **Publish website** turns green (about 1 minute), your link is shown there and under **Settings → Pages**.

Every time you push a change, the website updates by itself.

---

## 3. Android app

### Automatic APK (no Android Studio needed)
When you push to GitHub, the **Build Android app** workflow builds the app in the cloud (about 5–8 minutes). When it turns green, this link works for anyone:

**https://github.com/YOUR-USERNAME/oja-hustle/releases/download/android-latest/OjaHustle.apk**

Open it on an Android phone and install it. Android may ask you to allow "Install unknown apps" for your browser. The installed app works fully offline.

### Google Play Store (when you're ready)
1. Install **Android Studio** and Node.js, then run in this folder:
   ```bash
   npm install
   npm run android:add
   npm run android:icons
   npm run android:sync
   npm run android:open
   ```
2. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**, and create a keystore. **Keep the keystore file and password safe**, because you need them for every update.
3. Upload the `.aab` file at **play.google.com/console** (one-time US$25 developer fee).
4. Before publishing, change `appId` in `capacitor.config.json` to something unique to you (for example `com.yourname.ojahustle`). It can't be changed after the first Play Store upload.

---

## 4. iPhone / iPad

**Easiest (free):** iPhone players open your website link in Safari → **Share → Add to Home Screen**. It gets an icon, opens full-screen and works offline.

**App Store version:** this needs a Mac with Xcode and an Apple Developer account (US$99 a year):

```bash
npm install
npm run ios:add
npm run ios:icons
npm run ios:sync
npm run ios:open
```

In Xcode, choose your team under *Signing & Capabilities*, then **Product → Archive** and upload to App Store Connect.

---

## 5. Editing the game

Most changes only need the files in `www/js/data/`. Each file has notes at the top explaining every setting.

| I want to change… | Edit this file |
|---|---|
| How long a market day is, starting cash, patience, interest rates, loan costs, theft, when features unlock | `config.js` |
| Prices, which products exist, what spoils, what's popular | `products.js` |
| Business sizes: upgrade cost, customers per day, staff, wages, levy | `stages.js` |
| Story dialogue, chapter goals, gold-star day targets | `chapters.js` |
| Quiz questions and learning objectives | `quiz.js` |
| Scam / legit messages | `scams.js` |
| Daily events, characters, customer names | `events.js` |
| Agberos, fights, thieves, Task Force, Market Union, respect | `config.js` → the `street` section |
| Colours and fonts | `www/css/style.css` (the `:root` section at the top) |

**Examples**

- *Make the game easier:* in `config.js` raise `startCash`, or in `stages.js` raise `customers`.
- *Add a product:* copy a line in `products.js`, give it a new `id`, and set `unlockStage` (0 = stall, 1 = shop, 2 = mini-mart, 3 = supermarket). For `icon`, reuse one of: water, bottle, bread, bag, eggs, noodles, tin, oil, tomato, box, sack, diaper, chicken, soapbar, yam.
- *Add a quiz question:* copy a question in `quiz.js`, set its `chapter`, and set `c` to the position of the right answer (0 = first).

**After changing balance numbers**, run the bot to check every chapter is still finishable:

```bash
npm test                          # 30 games by a decent player
node tests/simulate.mjs 30 0.6    # a weaker player
```

It prints how many days each chapter takes. Aim for roughly 6–30 days per chapter.

**When you publish an update**, change the version in `www/sw.js` (`const CACHE = "oja-hustle-v1.0.1"`) so players' phones download the new files instead of using the old offline copy.

**Rebuild the one-file version** after edits: `npm install` once, then `npm run standalone`.

---

## Credits

- Game design and development: *[your group name]*: Victoria Egbeziemi Igbama, Great Chukwuemeka Udeji, Geoffrey Henry, Kamsi Chizuruoke Nwogu, Sybill E. Ekpo
- Font: **Poppins** by Indian Type Foundry, licensed under the SIL Open Font License 1.1 (free to use and bundle in apps). See https://github.com/itfoundry/Poppins
- All pictures and sounds are drawn and generated in code: no third-party art or audio.
- Built with plain HTML, CSS and JavaScript, packaged for Android/iOS with [Capacitor](https://capacitorjs.com).
