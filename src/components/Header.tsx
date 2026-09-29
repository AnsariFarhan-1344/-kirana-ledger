import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BRAND_NAME, TAGLINE } from '../config/brand';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { BookOpen, User, Store, Globe, Calculator } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole, currentLanguage, setLanguage, setIsCalculatorOpen } = useAppStore();

  const handleLanguageCycle = () => {
    if (currentLanguage === 'en') setLanguage('hi');
    else if (currentLanguage === 'hi') setLanguage('mr');
    else setLanguage('en');
  };

  const getLangLabel = () => {
    if (currentLanguage === 'hi') return 'हिन्दी';
    if (currentLanguage === 'mr') return 'मराठी';
    return 'EN';
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <BookOpen size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.titleColumn}>
          <Text style={styles.brandTitle}>{BRAND_NAME}</Text>
          <Text style={styles.tagline}>{TAGLINE}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Quick Calculator Button */}
        {role === 'shopkeeper' && (
          <TouchableOpacity
            style={styles.calcHeaderBtn}
            onPress={() => setIsCalculatorOpen(true)}
            accessibilityLabel="Dukaan Calculator"
          >
            <Calculator size={16} color={lightColors.text} />
          </TouchableOpacity>
        )}

        {/* Language Switcher */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={handleLanguageCycle}
          accessibilityLabel="Switch Language"
        >
          <Globe size={14} color={lightColors.primary} />
          <Text style={styles.langText}>{getLangLabel()}</Text>
        </TouchableOpacity>

        {/* Role Switcher */}
        <TouchableOpacity
          style={[styles.roleBadge, role === 'customer' ? styles.customerRoleBadge : styles.shopkeeperRoleBadge]}
          onPress={() => setRole(role === 'shopkeeper' ? 'customer' : 'shopkeeper')}
          accessibilityLabel="Switch View Role"
        >
          {role === 'shopkeeper' ? (
            <>
              <Store size={14} color="#FFFFFF" />
              <Text style={styles.roleText}>{t('role.shopkeeper')}</Text>
            </>
          ) : (
            <>
              <User size={14} color="#FFFFFF" />
              <Text style={styles.roleText}>{t('role.customer')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    letterSpacing: -0.2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: lightColors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    minHeight: 34,
  },
  langText: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: lightColors.primary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    minHeight: 34,
  },
  shopkeeperRoleBadge: {
    backgroundColor: lightColors.primary,
  },
  customerRoleBadge: {
    backgroundColor: lightColors.info,
  },
  roleText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});
