import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { speechService } from '../core/speech/SpeechService';
import { DiagnosticsInfo } from '../core/speech/types';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  Mic,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

interface MicTestScreenProps {
  onBack: () => void;
}

export const MicTestScreen: React.FC<MicTestScreenProps> = ({ onBack }) => {
  const [diag, setDiag] = useState<DiagnosticsInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [testTranscript, setTestTranscript] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    const res = await speechService.getDiagnostics();
    setDiag(res);
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const run5SecondTest = async () => {
    setIsTesting(true);
    setCountdown(5);
    setTestTranscript('');
    setTestResult(null);

    let currentText = '';

    await speechService.startListening({
      onStateChange: () => {},
      onInterimText: (text) => {
        currentText = text;
        setTestTranscript(text);
      },
      onFinalText: (text) => {
        currentText = text;
        setTestTranscript(text);
      },
      onError: (type, msg) => {
        setTestResult(`Error: ${type} - ${msg}`);
      },
    });

    let sec = 5;
    const interval = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) {
        clearInterval(interval);
        speechService.stopListening();
        setIsTesting(false);
        if (currentText.trim()) {
          setTestResult(`Success! Captured: "${currentText}"`);
        } else {
          setTestResult('No speech detected in 5 seconds.');
        }
        fetchDiagnostics();
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color={lightColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Microphone & Speech Test</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.leadText}>
          Aapke phone/browser ke microphone aur speech engine ki live jaanch.
        </Text>

        {/* Diagnostics Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environment Diagnostics</Text>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Secure Context (HTTPS/localhost):</Text>
            {diag?.isSecureContext ? (
              <View style={styles.badgeGood}>
                <CheckCircle size={14} color="#16A34A" />
                <Text style={styles.badgeGoodText}>Yes (Secure)</Text>
              </View>
            ) : (
              <View style={styles.badgeBad}>
                <XCircle size={14} color="#DC2626" />
                <Text style={styles.badgeBadText}>No (Requires HTTPS)</Text>
              </View>
            )}
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Speech API Available:</Text>
            {diag?.isApiAvailable ? (
              <View style={styles.badgeGood}>
                <CheckCircle size={14} color="#16A34A" />
                <Text style={styles.badgeGoodText}>Available</Text>
              </View>
            ) : (
              <View style={styles.badgeBad}>
                <XCircle size={14} color="#DC2626" />
                <Text style={styles.badgeBadText}>Not Available</Text>
              </View>
            )}
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Permission State:</Text>
            <Text style={styles.diagVal}>{diag?.permissionState || 'unknown'}</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Chosen Locale:</Text>
            <Text style={styles.diagVal}>{diag?.chosenLocale || 'hi-IN'}</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Speech Adapter:</Text>
            <Text style={styles.diagVal}>{diag?.adapterName || 'default'}</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Last Error Code:</Text>
            <Text style={styles.diagVal}>{diag?.lastErrorCode || 'None'}</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Platform / Browser:</Text>
            <Text style={styles.diagValSmall} numberOfLines={2}>
              {diag?.browserOrPlatform || Platform.OS}
            </Text>
          </View>
        </View>

        {/* 5-Second Test Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live 5-Second Speech Test</Text>
          <Text style={styles.cardDesc}>
            Button dabayein aur 5 second tak kuch bolein. Niche live transcript dikhega.
          </Text>

          <TouchableOpacity
            style={[styles.testBtn, isTesting && styles.testBtnActive]}
            onPress={run5SecondTest}
            disabled={isTesting}
          >
            <Mic size={18} color="#FFFFFF" />
            <Text style={styles.testBtnText}>
              {isTesting ? `Sun raha hoon... (${countdown}s)` : 'Test 5 Seconds'}
            </Text>
          </TouchableOpacity>

          {isTesting && (
            <View style={styles.liveBox}>
              <Text style={styles.liveLabel}>Live Transcript:</Text>
              <Text style={styles.liveText}>
                {testTranscript || 'Awaaz ka intezaar...'}
              </Text>
            </View>
          )}

          {testResult && !isTesting && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  leadText: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    marginBottom: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginBottom: 14,
    lineHeight: 18,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  diagLabel: {
    fontSize: 12,
    color: lightColors.muted,
    flex: 1,
  },
  diagVal: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  diagValSmall: {
    fontSize: 10,
    color: lightColors.muted,
    maxWidth: 160,
    textAlign: 'right',
  },
  badgeGood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: lightColors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: layout.pillRadius,
  },
  badgeGoodText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  badgeBad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: lightColors.dangerSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: layout.pillRadius,
  },
  badgeBadText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: lightColors.danger,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  testBtnActive: {
    backgroundColor: '#DC2626',
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  liveBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: lightColors.primary,
  },
  liveLabel: {
    fontSize: 10,
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  liveText: {
    fontSize: typography.sizes.body,
    color: lightColors.text,
    fontStyle: 'italic',
  },
  resultBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: lightColors.primarySoft,
    borderRadius: layout.inputRadius,
  },
  resultText: {
    fontSize: typography.sizes.xs,
    color: lightColors.primary,
    fontWeight: typography.weights.semibold,
  },
});
