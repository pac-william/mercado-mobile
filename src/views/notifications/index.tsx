import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getRelativeTime } from "../../utils/dateUtils";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { SPACING, FONT_SIZE, BORDER_RADIUS, ICON_SIZES, SHADOWS } from "../../constants/styles";

type NotificationsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'order' | 'system';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Pedido confirmado',
    message: 'Seu pedido #1234 foi confirmado e está sendo preparado',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    type: 'order'
  },
  {
    id: '2',
    title: 'Pedido a caminho',
    message: 'Seu pedido #1230 saiu para entrega',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    type: 'order'
  },
  {
    id: '3',
    title: 'Pedido entregue',
    message: 'Seu pedido #1228 foi entregue com sucesso',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    type: 'order'
  },
  {
    id: '4',
    title: 'Atualização do app',
    message: 'Nova versão disponível com melhorias de performance',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    type: 'system'
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [notifications] = useState<Notification[]>(mockNotifications);
  const { styles, theme: paperTheme } = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
    },
    header: {
      paddingVertical: SPACING.lg,
    },
    headerTitle: {
      fontSize: FONT_SIZE.displaySm,
      fontWeight: "bold",
      color: theme.colors.onBackground,
    },
    list: {
      paddingBottom: SPACING.xxxl * 2 + SPACING.xlBase,
    },
    notificationCard: {
      marginBottom: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      borderLeftWidth: 4,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.modalShadow,
      ...SHADOWS.medium,
    },
    cardContent: {
      flexDirection: "row",
      padding: SPACING.lg,
    },
    iconContainer: {
      width: ICON_SIZES.xxxl,
      height: ICON_SIZES.xxxl,
      borderRadius: BORDER_RADIUS.xxl,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
    textContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    title: {
      fontSize: FONT_SIZE.lg,
      flex: 1,
      color: theme.colors.onSurface,
    },
    unreadDot: {
      width: SPACING.xs,
      height: SPACING.xs,
      borderRadius: BORDER_RADIUS.xs,
      marginLeft: SPACING.xs,
      backgroundColor: theme.colors.primary,
    },
    message: {
      fontSize: FONT_SIZE.md,
      marginBottom: SPACING.xs,
      lineHeight: SPACING.xlBase,
      color: theme.colors.onSurfaceVariant,
    },
    time: {
      fontSize: FONT_SIZE.sm,
      color: theme.colors.onSurfaceVariant,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: SPACING.jumbo + SPACING.xxxl,
    },
    emptyText: {
      fontSize: FONT_SIZE.lg,
      marginTop: SPACING.md,
      color: theme.colors.onSurfaceVariant,
    },
  }));

  const getNotificationIcon = (type: string) => {
    if (type === 'order') return 'receipt-outline';
    if (type === 'system') return 'information-circle-outline';
    return 'notifications-outline';
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            borderLeftColor: item.read ? "transparent" : paperTheme.colors.primary,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={ICON_SIZES.xl}
              color={paperTheme.colors.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                {
                  fontWeight: item.read ? "normal" : "bold",
                },
              ]}
            >
                {item.title}
              </Text>
              {!item.read && (
              <View style={styles.unreadDot} />
              )}
            </View>
          <Text
            style={styles.message}
            numberOfLines={2}
          >
              {item.message}
            </Text>
          <Text
            style={styles.time}
          >
              {getRelativeTime(item.time.toISOString())}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notificações
          </Text>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={ICON_SIZES.xxxl + ICON_SIZES.sm}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyText}>
              Nenhuma notificação
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

