import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore, TabKey } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Package,
  Menu,
  Mic,
  FileText,
  CreditCard,
} from 'lucide-react-native';

interface BottomNavProps {
  onOpenMic: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMic }) => {
  const { t } = useTranslation();
  const { role, activeTab, setActiveTab } = useAppStore();

  if (role === 'customer') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('overview')}
          accessibilityLabel="My Khata"
        >
          <Users
            size={22}
            color={activeTab === 'overview' ? lightColors.primary : lightColors.muted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'overview' && styles.tabLabelActive,
            ]}
          >
            Mera Khata
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('bills')}
          accessibilityLabel="Customer Bills"
        >
          <FileText
            size={22}
            color={activeTab === 'bills' ? lightColors.primary : lightColors.muted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'bills' && styles.tabLabelActive,
            ]}
          >
            Parchi
          </Text>
        </TouchableOpacity>

        {/* E4. Raised Centre Pay Button */}
        <View style={styles.raisedMicWrapper}>
          <TouchableOpacity
            style={[styles.raisedMicButton, { backgroundColor: lightColors.primary }]}
            onPress={() => setActiveTab('overview')}
            accessibilityLabel="Pay via UPI"
          >
            <CreditCard size={24} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* E4. Puchho Help Button */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={onOpenMic}
          accessibilityLabel="Puchho Help"
        >
          <HelpCircle
            size={22}
            color={lightColors.muted}
          />
          <Text style={styles.tabLabel}>
            Puchho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
          accessibilityLabel="Settings"
        >
          <Menu
            size={22}
            color={activeTab === 'settings' ? lightColors.primary : lightColors.muted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'settings' && styles.tabLabelActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Overview */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('overview')}
        accessibilityLabel="Overview"
      >
        <LayoutDashboard
          size={22}
          color={activeTab === 'overview' ? lightColors.primary : lightColors.muted}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'overview' && styles.tabLabelActive,
          ]}
        >
          {t('nav.overview')}
        </Text>
      </TouchableOpacity>

      {/* 2. Ledger / Customers */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('ledger')}
        accessibilityLabel="Ledger Customers"
      >
        <Users
          size={22}
          color={activeTab === 'ledger' ? lightColors.primary : lightColors.muted}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'ledger' && styles.tabLabelActive,
          ]}
        >
          {t('nav.ledger')}
        </Text>
      </TouchableOpacity>

      {/* Raised Centre Mic */}
      <View style={styles.raisedMicWrapper}>
        <TouchableOpacity
          style={styles.raisedMicButton}
          onPress={onOpenMic}
          accessibilityLabel="Voice Record Assistant"
        >
          <Mic size={26} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 3. Inventory */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('inventory')}
        accessibilityLabel="Inventory"
      >
        <Package
          size={22}
          color={activeTab === 'inventory' ? lightColors.primary : lightColors.muted}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'inventory' && styles.tabLabelActive,
          ]}
        >
          {t('nav.inventory')}
        </Text>
      </TouchableOpacity>

      {/* 4. More Menu */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab('more')}
        accessibilityLabel="More Options"
      >
        <Menu
          size={22}
          color={
            ['more', 'bills', 'reminders', 'insights', 'settings', 'tests', 'suppliers'].includes(activeTab)
              ? lightColors.primary
              : lightColors.muted
          }
        />
        <Text
          style={[
            styles.tabLabel,
            ['more', 'bills', 'reminders', 'insights', 'settings', 'tests', 'suppliers'].includes(activeTab) &&
              styles.tabLabelActive,
          ]}
        >
          {t('nav.more')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: lightColors.surface,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  tabLabelActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  raisedMicWrapper: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  raisedMicButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: lightColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
