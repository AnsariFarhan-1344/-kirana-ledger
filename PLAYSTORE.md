# Google Play Store Listing & Data Safety Documentation

**Application Name:** Kirana Ledger  
**Package:** `com.kiranaledger.app`  
**Category:** Business / Finance (Bookkeeping)  
**Content Rating:** Everyone (3+)

---

## 1. Store Listing Text

### A. English (en-IN)
- **Title (<= 30 chars):** Kirana Ledger: Udhaar & Bill
- **Short Description (<= 80 chars):** Bolke hisaab rakho. AI digital bahi-khata, bill parchi & stock for shopkeepers.
- **Full Description:**
> **Kirana Ledger — Bolke Hisaab Rakho.**
> 
> The first digital bahi-khata designed for busy Indian kirana and general store owners who work with their hands and don't have time to type long forms.
>
> 🎙️ **Just Speak ONE Sentence:**
> Speak naturally in Hinglish, Hindi, Marathi, or English:
> • *"Ramesh ne 500 rupaye ka maal liya"*
> • *"Amit ne 200 de diye"*
> • *"रमेशने 500 रुपयांचा माल घेतला"*
> • *"Priya ne 2 kilo sugar liya 180 ki"*
>
> ⚡ **What Happens in 1 Second:**
> • AI extracts Customer, Amount, Credit/Payment type, and Items.
> • Automatically updates Customer Balance + Sequential Bill (HB-1042) + Inventory Stock in **one atomic transaction**.
> • 5-second Instant Undo toast to reverse if you make a mistake.
>
> 🛡️ **Why Indian Shopkeepers Trust Kirana Ledger:**
> • **100% Offline-First:** Works without internet. Your records never leave your phone.
> • **No Silent Guesses:** Never guesses money or stock. If anything is unclear, it asks with big, friendly buttons.
> • **WhatsApp Reminders:** Polite reminder messages in Hindi, Marathi, and Hinglish with merchant UPI QR code.
> • **Two-Sided Customer Khata:** Customers can check their bills, acknowledge entries (Sahi hai ✓), or pay via UPI.
> • **Serving Mode (Rush Hour):** Giant hands-free microphone mode to queue 10 entries quickly when your shop is crowded.
> • **Roz Ka Hisaab:** Daily closing summary comparing cash in hand, UPI, and total udhaar given.
>
> *Disclaimer: Kirana Ledger is a digital bookkeeping assistant and record-keeping tool. It is not a bank or payment processor.*

---

### B. Hindi (hi-IN)
- **शीर्षक:** Kirana Ledger: बही खाता व बिल
- **संक्षिप्त विवरण:** बोलके हिसाब रखो। दुकानदारों के लिए AI डिजिटल बही-खाता, पर्ची व स्टॉक।
- **पूर्ण विवरण:**
> **Kirana Ledger — बोलके हिसाब रखो।**
>
> व्यस्त किराना व जनरल स्टोर दुकानदारों के लिए विशेष रूप से निर्मित डिजिटल बही-खाता। अब फार्म भरने की कोई ज़रूरत नहीं!
>
> 🎙️ **बस एक वाक्य बोलें:**
> • "रमेश ने 500 रुपये का माल लिया"
> • "अमित ने 200 दे दिए"
> • "प्रिया ने 2 किलो चीनी ली 180 की"
>
> ⚡ **विशेषताएं:**
> • **एक क्लिक में सब अपडेट:** खाता + बिल पर्ची (HB-1042) + दुकान का स्टॉक।
> • **पूर्णतः ऑफलाइन:** बिना इंटरनेट के काम करता है। आपका डेटा आपके फोन में सुरक्षित है।
> • **व्हाट्सएप तगादा:** ग्राहक की भाषा (हिन्दी/मराठी/हिंग्लिश) में विनम्र तगादा मैसेज।
> • **रोज का हिसाब:** शाम को दुकान बंद करते समय दैनिक नकद और उधारी का सटीक मिलान।

---

### C. Marathi (mr-IN)
- **शीर्षक:** Kirana Ledger: उधारी वही व बिल
- **संक्षिप्त विवरण:** बोलून हिशोब ठेवा. किराणा दुकानदारांसाठी AI डिजिटल खातेवही व पावती.
- **पूर्ण विवरण:**
> **Kirana Ledger — बोलून हिशोब ठेवा.**
>
> 🎙️ **फक्त एक वाक्य बोला:**
> • "रमेशने 500 रुपयांचा माल घेतला"
> • "अमितने दोनशे रुपये दिले"
> • "प्रियाने अडीचशे रुपये दिले"
>
> ⚡ **वैशिष्ट्ये:**
> • **100% ऑफलाइन:** इंटरनेट नसतानाही सुरळीत चालते.
> • **झटपट पावती:** व्हॉट्सॲपवर पावती आणि UPI QR पाठवा.
> • **ग्राहक खात्री:** ग्राहक स्वतः खात्याची खात्री करू शकतात (बरोबर आहे ✓).

---

## 2. Google Play Console — Data Safety Questionnaire Answers

| Question | Answer | Rationale |
|---|---|---|
| Does your app collect or share user data? | **No data collected remotely** | All records are stored exclusively in on-device SQLite database. |
| Is data encrypted in transit? | **Yes** | Shared receipts and UPI links utilize system secure channels. |
| Do you provide a way for users to request data deletion? | **Yes** | Users can reset or delete all data anytime from in-app Settings. |
| Location data collected? | **No** | Zero location permissions declared. |
| Personal info collected? | **On-device only** | Customer names/phones stored in local DB only; never sent to cloud servers. |
| Financial info collected? | **On-device only** | Bookkeeping numbers never sent to remote third-party databases. |
| Health, Contacts, Calendar? | **No** | No permissions requested. |
| Audio/Voice recordings? | **Processed on device** | Voice audio is parsed live on-device into text; audio is discarded immediately. |

---

## 3. Play Store Screenshots Checklist (1080 x 1920 px)
1. **Screenshot 1 (Hero):** Home screen showing conversation bar + 🎙️ "Ramesh ne 500 rupaye ka maal liya" + AI Understanding Card.
2. **Screenshot 2 (Ledger):** Lal Bahi style customer list with green/amber/red status dots and clear balances.
3. **Screenshot 3 (Parchi):** Sequential `HB-1042` digital receipt with merchant UPI QR code and WhatsApp share button.
4. **Screenshot 4 (Serving Mode):** Full-screen giant microphone in Serving Mode for rush-hour hands-free queueing.
5. **Screenshot 5 (Roz Ka Hisaab):** Daily closing modal with Cash vs UPI breakdown and net cashflow summary.
6. **Screenshot 6 (Customer Mode):** "My Khata" view with `[Sahi hai ✓]` customer verification and dispute handling.
