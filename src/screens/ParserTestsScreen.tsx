import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { parseSentenceToEntry } from '../core/parser/ParserService';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

interface TestCase {
  sentence: string;
  expectedCustomer: string;
  expectedAmount: number;
  expectedType: 'CREDIT' | 'PAYMENT' | 'UNKNOWN';
  lang: string;
}

export const PARSER_TEST_CASES: TestCase[] = [
  // 1. Brief exact examples (All 4 languages)
  {
    sentence: 'Ramesh ne 500 rupaye ka maal liya',
    expectedCustomer: 'Ramesh',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Hinglish',
  },
  {
    sentence: 'रमेश ने 500 रुपये का माल लिया',
    expectedCustomer: 'रमेश',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Hindi',
  },
  {
    sentence: 'रमेशने 500 रुपयांचा माल घेतला',
    expectedCustomer: 'रमेश',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Marathi',
  },
  {
    sentence: 'रमेशने पाचशे रुपयांचा माल घेतला',
    expectedCustomer: 'रमेश',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Marathi Words',
  },
  {
    sentence: 'Ramesh ne paanch sau ka saman liya',
    expectedCustomer: 'Ramesh',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Hinglish Words',
  },
  {
    sentence: 'Ramesh gave me 500',
    expectedCustomer: 'Ramesh',
    expectedAmount: 500,
    expectedType: 'PAYMENT',
    lang: 'English Direction',
  },
  {
    sentence: 'Ramesh ne 200 diye',
    expectedCustomer: 'Ramesh',
    expectedAmount: 200,
    expectedType: 'PAYMENT',
    lang: 'Hinglish Payment',
  },
  {
    sentence: 'Suresh ko 350 ka udhaar',
    expectedCustomer: 'Suresh',
    expectedAmount: 350,
    expectedType: 'CREDIT',
    lang: 'Hinglish Credit',
  },
  {
    sentence: 'Ramesh ke 500',
    expectedCustomer: 'Ramesh',
    expectedAmount: 500,
    expectedType: 'UNKNOWN',
    lang: 'Ambiguous Type',
  },
  {
    sentence: 'Priya ne 2 kilo sugar liya 180 ki',
    expectedCustomer: 'Priya',
    expectedAmount: 180,
    expectedType: 'CREDIT',
    lang: 'Items + Qty',
  },

  // 2. Hindi & Marathi Spoken Number Words
  {
    sentence: 'Amit ne dedh sau diye',
    expectedCustomer: 'Amit',
    expectedAmount: 150,
    expectedType: 'PAYMENT',
    lang: 'Hindi Dedh Sau',
  },
  {
    sentence: 'Suresh ne dhai sau ka maal liya',
    expectedCustomer: 'Suresh',
    expectedAmount: 250,
    expectedType: 'CREDIT',
    lang: 'Hindi Dhai Sau',
  },
  {
    sentence: 'Imran ne ek hazaar jama karwaye',
    expectedCustomer: 'Imran',
    expectedAmount: 1000,
    expectedType: 'PAYMENT',
    lang: 'Hindi Hazaar',
  },
  {
    sentence: 'रमेशने दोनशे रुपये दिले',
    expectedCustomer: 'रमेश',
    expectedAmount: 200,
    expectedType: 'PAYMENT',
    lang: 'Marathi Don-she',
  },
  {
    sentence: 'अमितला दीडशे रुपयांचा माल दिला',
    expectedCustomer: 'अमित',
    expectedAmount: 150,
    expectedType: 'CREDIT',
    lang: 'Marathi Deed-she',
  },
  {
    sentence: 'प्रियाने अडीचशे रुपये दिले',
    expectedCustomer: 'प्रिया',
    expectedAmount: 250,
    expectedType: 'PAYMENT',
    lang: 'Marathi Adeech-she',
  },
  {
    sentence: 'सुरेशने हजार रुपये दिले',
    expectedCustomer: 'सुरेश',
    expectedAmount: 1000,
    expectedType: 'PAYMENT',
    lang: 'Marathi Hazaar',
  },

  // 3. English Number Words
  {
    sentence: 'Neha paid five hundred cash',
    expectedCustomer: 'Neha',
    expectedAmount: 500,
    expectedType: 'PAYMENT',
    lang: 'English Words',
  },
  {
    sentence: 'Rajesh took one fifty groceries credit',
    expectedCustomer: 'Rajesh',
    expectedAmount: 150,
    expectedType: 'CREDIT',
    lang: 'English One Fifty',
  },

  // 4. Direction & Action Verbs
  {
    sentence: 'Neha ne 1200 wapas kiye',
    expectedCustomer: 'Neha',
    expectedAmount: 1200,
    expectedType: 'PAYMENT',
    lang: 'Wapas Kiye',
  },
  {
    sentence: 'Rajesh ne 400 chukaya',
    expectedCustomer: 'Rajesh',
    expectedAmount: 400,
    expectedType: 'PAYMENT',
    lang: 'Chukaya',
  },
  {
    sentence: 'Imran le gaya 600 ka tel',
    expectedCustomer: 'Imran',
    expectedAmount: 600,
    expectedType: 'CREDIT',
    lang: 'Le Gaya',
  },
  {
    sentence: 'Suresh ne 2k pay kiya UPI se',
    expectedCustomer: 'Suresh',
    expectedAmount: 2000,
    expectedType: 'PAYMENT',
    lang: '2k UPI',
  },
  {
    sentence: 'Amit ne 750 udhaar liye',
    expectedCustomer: 'Amit',
    expectedAmount: 750,
    expectedType: 'CREDIT',
    lang: 'Udhaar Liye',
  },

  // 5. Multi-Entry
  {
    sentence: 'Ramesh 200 aur Amit 300 de gaye',
    expectedCustomer: 'Ramesh',
    expectedAmount: 200,
    expectedType: 'PAYMENT',
    lang: 'Multi-entry (1st)',
  },

  // 6. Suffixes & Honorifics
  {
    sentence: 'Ramesh bhai ne 500 diye',
    expectedCustomer: 'Ramesh bhai',
    expectedAmount: 500,
    expectedType: 'PAYMENT',
    lang: 'Honorific Bhai',
  },
  {
    sentence: 'Patil ji ko 450 ka udhaar',
    expectedCustomer: 'Patil ji',
    expectedAmount: 450,
    expectedType: 'CREDIT',
    lang: 'Honorific Ji',
  },
  {
    sentence: 'रमेशला 300 रुपयांचा किराणा दिला',
    expectedCustomer: 'रमेश',
    expectedAmount: 300,
    expectedType: 'CREDIT',
    lang: 'Suffix -ला',
  },

  // 7. Relative Dates
  {
    sentence: 'Ramesh ne kal ka 400 de diya',
    expectedCustomer: 'Ramesh',
    expectedAmount: 400,
    expectedType: 'PAYMENT',
    lang: 'Date: Kal Ka',
  },
  {
    sentence: 'Amit ne aaj 350 jama kiya',
    expectedCustomer: 'Amit',
    expectedAmount: 350,
    expectedType: 'PAYMENT',
    lang: 'Date: Aaj',
  },

  // 8. Items extraction
  {
    sentence: 'Amit ko 2 kilo rice, 1 oil aur 1 kilo sugar diya, total 640 udhaar',
    expectedCustomer: 'Amit',
    expectedAmount: 640,
    expectedType: 'CREDIT',
    lang: 'Itemized Multi-product',
  },
  {
    sentence: 'Priya ne 1 packet chai patti li 120 ki',
    expectedCustomer: 'Priya',
    expectedAmount: 120,
    expectedType: 'CREDIT',
    lang: 'Item Packet',
  },
  {
    sentence: 'Suresh ne 5 kilo atta liya 220 ka',
    expectedCustomer: 'Suresh',
    expectedAmount: 220,
    expectedType: 'CREDIT',
    lang: 'Atta 5kg',
  },
  {
    sentence: 'Neha took 3 milk packets 90 rupees',
    expectedCustomer: 'Neha',
    expectedAmount: 90,
    expectedType: 'CREDIT',
    lang: 'English Items',
  },
  {
    sentence: 'Rajesh ne 500 cash diye',
    expectedCustomer: 'Rajesh',
    expectedAmount: 500,
    expectedType: 'PAYMENT',
    lang: 'Cash Payment',
  },
  {
    sentence: 'Imran ne 1500 gpay kiya',
    expectedCustomer: 'Imran',
    expectedAmount: 1500,
    expectedType: 'PAYMENT',
    lang: 'Gpay UPI',
  },
  {
    sentence: 'Suresh ne kal parso ka hisaab 800 chukta kiya',
    expectedCustomer: 'Suresh',
    expectedAmount: 800,
    expectedType: 'PAYMENT',
    lang: 'Chukta',
  },
  {
    sentence: 'रमेशने पाचशे रुपयांचे तेल घेतले',
    expectedCustomer: 'रमेश',
    expectedAmount: 500,
    expectedType: 'CREDIT',
    lang: 'Marathi Tel Ghetle',
  },
  {
    sentence: 'Priya ne sava do sau rupaye diye',
    expectedCustomer: 'Priya',
    expectedAmount: 225,
    expectedType: 'PAYMENT',
    lang: 'Sava Do Sau',
  },
  {
    sentence: 'Amit kal dega',
    expectedCustomer: 'Amit',
    expectedAmount: 0,
    expectedType: 'CREDIT',
    lang: 'Promise to Pay',
  },
];

export const ParserTestsScreen: React.FC = () => {
  const [results, setResults] = useState<
    Array<{ passed: boolean; actual: any; test: TestCase }>
  >([]);
  const [hasRun, setHasRun] = useState(false);

  const runAllTests = () => {
    const res = PARSER_TEST_CASES.map((tc) => {
      const parsed = parseSentenceToEntry(tc.sentence);
      const firstEntry = parsed.entries[0];

      // Handle promise test case
      if (parsed.isPromise) {
        const passed =
          parsed.promiseCustomer?.toLowerCase() === tc.expectedCustomer.toLowerCase();
        return { passed, actual: parsed, test: tc };
      }

      if (!firstEntry) {
        return { passed: false, actual: null, test: tc };
      }

      const custMatch =
        firstEntry.customerRef.toLowerCase().includes(tc.expectedCustomer.toLowerCase()) ||
        tc.expectedCustomer.toLowerCase().includes(firstEntry.customerRef.toLowerCase());

      const amtMatch = firstEntry.amount === tc.expectedAmount;
      const typeMatch = firstEntry.type === tc.expectedType;

      const passed = custMatch && amtMatch && typeMatch;
      return { passed, actual: firstEntry, test: tc };
    });

    setResults(res);
    setHasRun(true);
  };

  const passCount = results.filter((r) => r.passed).length;

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>NLU Parser Test Suite</Text>
          <Text style={styles.subtitle}>
            40+ Hinglish, Hindi, Marathi & English real test sentences
          </Text>
        </View>

        <TouchableOpacity style={styles.runBtn} onPress={runAllTests}>
          <Play size={16} color="#FFFFFF" />
          <Text style={styles.runBtnText}>Run Tests</Text>
        </TouchableOpacity>
      </View>

      {hasRun && (
        <View
          style={[
            styles.scoreBanner,
            passCount === results.length ? styles.bannerPass : styles.bannerWarn,
          ]}
        >
          <Sparkles size={18} color="#FFFFFF" />
          <Text style={styles.scoreText}>
            Passed: {passCount} / {results.length} tests ({Math.round(
              (passCount / results.length) * 100
            )}
            %)
          </Text>
        </View>
      )}

      {/* Tests List */}
      <FlatList
        data={hasRun ? results : PARSER_TEST_CASES.map((tc) => ({ test: tc, passed: null, actual: null }))}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const tc = item.test;
          return (
            <View style={styles.testCard}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.indexBadge}>#{index + 1}</Text>
                  <Text style={styles.langBadge}>{tc.lang}</Text>
                </View>

                {item.passed !== null && (
                  <View style={styles.statusWrap}>
                    {item.passed ? (
                      <CheckCircle size={18} color={lightColors.primary} />
                    ) : (
                      <XCircle size={18} color={lightColors.danger} />
                    )}
                  </View>
                )}
              </View>

              <Text style={styles.sentenceText}>"{tc.sentence}"</Text>

              <View style={styles.metaRow}>
                <Text style={styles.expectedText}>
                  Expected: {tc.expectedCustomer} • {tc.expectedType} • ₹{tc.expectedAmount}
                </Text>

                {item.actual && (
                  <Text
                    style={[
                      styles.actualText,
                      item.passed ? styles.actualPass : styles.actualFail,
                    ]}
                  >
                    Actual: {item.actual.customerRef || item.actual.promiseCustomer} •{' '}
                    {item.actual.type || 'PROMISE'} • ₹{item.actual.amount || 0}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  title: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: layout.cardRadius,
  },
  bannerPass: {
    backgroundColor: lightColors.primary,
  },
  bannerWarn: {
    backgroundColor: lightColors.accent,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  testCard: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indexBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
  },
  langBadge: {
    backgroundColor: lightColors.surfaceSubtle,
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentenceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 6,
  },
  metaRow: {
    gap: 2,
  },
  expectedText: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  actualText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  actualPass: {
    color: lightColors.primary,
  },
  actualFail: {
    color: lightColors.danger,
  },
});
