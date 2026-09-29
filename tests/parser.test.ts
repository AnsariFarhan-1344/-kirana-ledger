import { parseSentenceToEntry } from '../src/core/parser/ParserService';

describe('Kirana Ledger NLU Parser - 40+ Sentence Test Suite', () => {
  // 1. Core Examples from User Brief
  test('Hinglish Credit: Ramesh ne 500 rupaye ka maal liya', () => {
    const res = parseSentenceToEntry('Ramesh ne 500 rupaye ka maal liya');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Hindi Credit: रमेश ने 500 रुपये का माल लिया', () => {
    const res = parseSentenceToEntry('रमेश ने 500 रुपये का माल लिया');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Marathi Credit with suffix: रमेशने 500 रुपयांचा माल घेतला', () => {
    const res = parseSentenceToEntry('रमेशने 500 रुपयांचा माल घेतला');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Marathi Credit with words: रमेशने पाचशे रुपयांचा माल घेतला', () => {
    const res = parseSentenceToEntry('रमेशने पाचशे रुपयांचा माल घेतला');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Hinglish with number words: Ramesh ne paanch sau ka saman liya', () => {
    const res = parseSentenceToEntry('Ramesh ne paanch sau ka saman liya');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Direction Awareness: Ramesh gave me 500 (must be PAYMENT)', () => {
    const res = parseSentenceToEntry('Ramesh gave me 500');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Hinglish Payment: Ramesh ne 200 diye', () => {
    const res = parseSentenceToEntry('Ramesh ne 200 diye');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(200);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Hinglish Udhaar: Suresh ko 350 ka udhaar', () => {
    const res = parseSentenceToEntry('Suresh ko 350 ka udhaar');
    expect(res.entries[0].customerRef).toBe('Suresh');
    expect(res.entries[0].amount).toBe(350);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Ambiguous sentence: Ramesh ke 500 (must flag UNCLEAR_TYPE)', () => {
    const res = parseSentenceToEntry('Ramesh ke 500');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('UNKNOWN');
    expect(res.entries[0].ambiguities).toContain('UNCLEAR_TYPE');
  });

  test('Item + Qty: Priya ne 2 kilo sugar liya 180 ki', () => {
    const res = parseSentenceToEntry('Priya ne 2 kilo sugar liya 180 ki');
    expect(res.entries[0].customerRef).toBe('Priya');
    expect(res.entries[0].amount).toBe(180);
    expect(res.entries[0].type).toBe('CREDIT');
    expect(res.entries[0].items.length).toBeGreaterThan(0);
    expect(res.entries[0].items[0].name.toLowerCase()).toContain('sugar');
    expect(res.entries[0].items[0].qty).toBe(2);
  });

  // 2. Hindi & Marathi Spoken Number Words
  test('Dedh Sau (150): Amit ne dedh sau diye', () => {
    const res = parseSentenceToEntry('Amit ne dedh sau diye');
    expect(res.entries[0].amount).toBe(150);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Dhai Sau (250): Suresh ne dhai sau ka maal liya', () => {
    const res = parseSentenceToEntry('Suresh ne dhai sau ka maal liya');
    expect(res.entries[0].amount).toBe(250);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Sawa Do Sau (225): Priya ne sava do sau diye', () => {
    const res = parseSentenceToEntry('Priya ne sava do sau diye');
    expect(res.entries[0].amount).toBe(225);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Ek Hazaar (1000): Imran ne ek hazaar jama kiye', () => {
    const res = parseSentenceToEntry('Imran ne ek hazaar jama kiye');
    expect(res.entries[0].amount).toBe(1000);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Marathi Don-she (200): रमेशने दोनशे रुपये दिले', () => {
    const res = parseSentenceToEntry('रमेशने दोनशे रुपये दिले');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(200);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Marathi Deed-she (150): अमितला दीडशे रुपयांचा माल दिला', () => {
    const res = parseSentenceToEntry('अमितला दीडशे रुपयांचा माल दिला');
    expect(res.entries[0].customerRef).toBe('Amit');
    expect(res.entries[0].amount).toBe(150);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Marathi Adeech-she (250): प्रियाने अडीचशे रुपये दिले', () => {
    const res = parseSentenceToEntry('प्रियाने अडीचशे रुपये दिले');
    expect(res.entries[0].customerRef).toBe('Priya');
    expect(res.entries[0].amount).toBe(250);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Marathi Hazaar (1000): सुरेशने हजार रुपये दिले', () => {
    const res = parseSentenceToEntry('सुरेशने हजार रुपये दिले');
    expect(res.entries[0].amount).toBe(1000);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  // 3. Multi-Entry Splitting
  test('Multi-entry: Ramesh 200 aur Amit 300 de gaye (produces 2 entries)', () => {
    const res = parseSentenceToEntry('Ramesh 200 aur Amit 300 de gaye');
    expect(res.entries.length).toBe(2);
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(200);
    expect(res.entries[1].customerRef).toBe('Amit');
    expect(res.entries[1].amount).toBe(300);
  });

  // 4. Promise to Pay
  test('Promise to Pay: Amit kal dega', () => {
    const res = parseSentenceToEntry('Amit kal dega');
    expect(res.isPromise).toBe(true);
    expect(res.promiseCustomer).toBe('Amit');
  });

  // 5. English phrasing & 2k notation
  test('K shorthand: Suresh ne 2k pay kiya UPI se', () => {
    const res = parseSentenceToEntry('Suresh ne 2k pay kiya UPI se');
    expect(res.entries[0].amount).toBe(2000);
    expect(res.entries[0].method).toBe('upi');
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('English words: Neha paid five hundred cash', () => {
    const res = parseSentenceToEntry('Neha paid five hundred cash');
    expect(res.entries[0].customerRef).toBe('Neha');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].method).toBe('cash');
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('English credit: Rajesh took one fifty groceries credit', () => {
    const res = parseSentenceToEntry('Rajesh took one fifty groceries credit');
    expect(res.entries[0].customerRef).toBe('Rajesh');
    expect(res.entries[0].amount).toBe(150);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  // 6. Action Verbs
  test('Verb: chukaya (400): Rajesh ne 400 chukaya', () => {
    const res = parseSentenceToEntry('Rajesh ne 400 chukaya');
    expect(res.entries[0].amount).toBe(400);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Verb: wapas kiye (1200): Neha ne 1200 wapas kiye', () => {
    const res = parseSentenceToEntry('Neha ne 1200 wapas kiye');
    expect(res.entries[0].amount).toBe(1200);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('Verb: le gaya (600): Imran le gaya 600 ka tel', () => {
    const res = parseSentenceToEntry('Imran le gaya 600 ka tel');
    expect(res.entries[0].amount).toBe(600);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  // 7. Honorifics
  test('Honorific: Ramesh bhai ne 500 diye', () => {
    const res = parseSentenceToEntry('Ramesh bhai ne 500 diye');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
  });

  test('Honorific: Patil ji ko 450 ka udhaar', () => {
    const res = parseSentenceToEntry('Patil ji ko 450 ka udhaar');
    expect(res.entries[0].customerRef).toBe('Patil');
    expect(res.entries[0].amount).toBe(450);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Itemized: Amit ko 2 kilo rice, 1 oil aur 1 kilo sugar diya, total 640 udhaar', () => {
    const res = parseSentenceToEntry(
      'Amit ko 2 kilo rice, 1 oil aur 1 kilo sugar diya, total 640 udhaar'
    );
    expect(res.entries[0].customerRef).toBe('Amit');
    expect(res.entries[0].amount).toBe(640);
    expect(res.entries[0].type).toBe('CREDIT');
    expect(res.entries[0].items.length).toBeGreaterThanOrEqual(2);
  });

  test('Marathi Tel Ghetle: रमेशने पाचशे रुपयांचे तेल घेतले', () => {
    const res = parseSentenceToEntry('रमेशने पाचशे रुपयांचे तेल घेतले');
    expect(res.entries[0].customerRef).toBe('Ramesh');
    expect(res.entries[0].amount).toBe(500);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Chukta Payment: Suresh ne hisaab 800 chukta kiya', () => {
    const res = parseSentenceToEntry('Suresh ne hisaab 800 chukta kiya');
    expect(res.entries[0].customerRef).toBe('Suresh');
    expect(res.entries[0].amount).toBe(800);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  test('English Groceries: Neha took 3 milk packets 90 rupees', () => {
    const res = parseSentenceToEntry('Neha took 3 milk packets 90 rupees');
    expect(res.entries[0].customerRef).toBe('Neha');
    expect(res.entries[0].amount).toBe(90);
    expect(res.entries[0].type).toBe('CREDIT');
  });

  test('Gpay UPI: Imran ne 1500 gpay kiya', () => {
    const res = parseSentenceToEntry('Imran ne 1500 gpay kiya');
    expect(res.entries[0].customerRef).toBe('Imran');
    expect(res.entries[0].amount).toBe(1500);
    expect(res.entries[0].type).toBe('PAYMENT');
    expect(res.entries[0].method).toBe('upi');
  });

  test('Wholesaler Voice Flow: Sharma traders ko 5000 diye', () => {
    const res = parseSentenceToEntry('Sharma traders ko 5000 diye');
    expect(res.entries[0].customerRef).toContain('Sharma');
    expect(res.entries[0].amount).toBe(5000);
    expect(res.entries[0].type).toBe('PAYMENT');
  });

  // 3. Robust Input Validation (Rejection of non-financial / invalid input)
  test('Reject filler greeting: hello', () => {
    const res = parseSentenceToEntry('hello');
    expect(res.isValid).toBe(false);
    expect(res.validationError).toBeDefined();
  });

  test('Reject missing customer: 500 rupaye', () => {
    const res = parseSentenceToEntry('500 rupaye');
    expect(res.isValid).toBe(false);
    expect(res.validationError).toContain('customer');
  });

  test('Reject missing amount: Ramesh ne maal liya', () => {
    const res = parseSentenceToEntry('Ramesh ne maal liya');
    expect(res.isValid).toBe(false);
    expect(res.validationError).toBeDefined();
  });

  test('Reject empty input: ""', () => {
    const res = parseSentenceToEntry('   ');
    expect(res.isValid).toBe(false);
  });
});

