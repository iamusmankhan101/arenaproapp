import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Platform,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../theme/theme';

export default function ReferralModal({ visible, onDismiss, user, hasCompletedBooking = false }) {
  const [copied, setCopied] = useState(false);

  // Generate referral code from user ID (first 8 characters)
  const referralCode = user?.uid ? user.uid.substring(0, 8).toUpperCase() : 'ARENA123';
  const referralLink = `https://arenapropk.online/ref/${referralCode}`;

  const handleCopyCode = async () => {
    if (!hasCompletedBooking) return;
    
    try {
      await Clipboard.setStringAsync(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (!hasCompletedBooking) return;
    
    try {
      const message = `Join Arena Pro and book your favorite sports venues! Use my referral code: ${referralCode}\n\nDownload now: ${referralLink}`;
      
      await Share.share({
        message,
        title: 'Join Arena Pro',
        url: referralLink,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="card-giftcard" 
                size={48} 
                color={hasCompletedBooking ? theme.colors.secondary : theme.colors.textSecondary} 
              />
            </View>
            <Text style={styles.title}>Refer & Earn</Text>
            <Text style={styles.subtitle}>
              {hasCompletedBooking 
                ? 'Share Arena Pro with friends and earn rewards!'
                : 'Complete your first booking to unlock referral rewards!'}
            </Text>
          </View>

          {hasCompletedBooking ? (
            <>
              {/* Referral Code Card */}
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Your Referral Code</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{String(referralCode)}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name={copied ? "check" : "content-copy"} 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.copyButtonText}>
                      {String(copied ? 'Copied!' : 'Copy')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Benefits */}
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>How it works</Text>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="share" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      Share your code with friends
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="person-add" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      They sign up using your code
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="card-giftcard" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      Both get PKR 200 discount on booking
                    </Text>
                  </View>
                </View>
              </View>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <MaterialIcons name="share" size={24} color={theme.colors.secondary} />
                <Text style={styles.shareButtonText}>Share with Friends</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Not Eligible Message */}
              <View style={styles.notEligibleCard}>
                <MaterialIcons name="lock" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.notEligibleTitle}>Referral Program Locked</Text>
                <Text style={styles.notEligibleText}>
                  Complete your first booking to unlock the referral program and start earning rewards!
                </Text>
              </View>

              {/* Steps to Unlock */}
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>How to unlock</Text>
                
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      Browse and find your favorite venue
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="event" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      Select date and time slot
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialIcons name="check-circle" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitText}>
                      Complete your first booking
                    </Text>
                  </View>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.shareButton, styles.closeButtonStyle]}
                onPress={onDismiss}
                activeOpacity={0.8}
              >
                <Text style={styles.shareButtonText}>Got it</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'ClashDisplay-Medium',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: 20,
  },
  codeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: 'ClashDisplay-Medium',
    letterSpacing: 2,
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
    fontFamily: 'ClashDisplay-Medium',
  },
  notEligibleCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  notEligibleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'ClashDisplay-Medium',
    textAlign: 'center',
  },
  notEligibleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  closeButtonStyle: {
    backgroundColor: theme.colors.textSecondary,
  },
});
