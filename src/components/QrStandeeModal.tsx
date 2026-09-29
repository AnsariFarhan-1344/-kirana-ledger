import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { QrCode, X, Share2, Printer, ShieldCheck } from 'lucide-react-native';

export const QrStandeeModal: React.FC = () => {
  const { isQrStandeeOpen, setIsQrStandeeOpen, profile } = useAppStore();

  if (!isQrStandeeOpen) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Namaste! ${profile.name} par UPI se payment karein: ${profile.upiId}. Dhanyawad!`,
      });
    } catch (e) {}
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  };

  return (
    <Modal
      visible={isQrStandeeOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsQrStandeeOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.standeeCard}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setIsQrStandeeOpen(false)}
          >
            <X size={18} color={lightColors.muted} />
          </TouchableOpacity>

          {/* Saffron Standee Header */}
          <View style={styles.standeeHeader}>
            <Text style={styles.standeeHeaderSub}>BHARAT QR • ALL UPI APPS</Text>
            <Text style={styles.standeeShopName}>{profile.name}</Text>
            <Text style={styles.standeeAddress}>{profile.address}</Text>
          </View>

          {/* QR Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <QrCode size={180} color="#1E293B" strokeWidth={1.5} />
            </View>
            <Text style={styles.upiIdText}>UPI ID: {profile.upiId}</Text>
            <View style={styles.secureBadge}>
              <ShieldCheck size={14} color={lightColors.primary} />
              <Text style={styles.secureText}>100% Direct Dukaan Account Transfer</Text>
            </View>
          </View>

          {/* Accepted Apps Bar */}
          <View style={styles.appsRow}>
            <Text style={styles.appTag}>PhonePe</Text>
            <Text style={styles.appTag}>Google Pay</Text>
            <Text style={styles.appTag}>Paytm</Text>
            <Text style={styles.appTag}>BHIM</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share QR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Printer size={16} color={lightColors.text} />
              <Text style={styles.printBtnText}>Counter Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  standeeCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: lightColors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  standeeHeader: {
    backgroundColor: '#D97706',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  standeeHeaderSub: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#FEF3C7',
    letterSpacing: 1,
    marginBottom: 4,
  },
  standeeShopName: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  standeeAddress: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  qrBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  upiIdText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#1E293B',
    marginBottom: 8,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.pillRadius,
  },
  secureText: {
    fontSize: 11,
    color: lightColors.primary,
    fontWeight: typography.weights.medium,
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appTag: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    backgroundColor: lightColors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: lightColors.background,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
  },
  printBtnText: {
    color: lightColors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
