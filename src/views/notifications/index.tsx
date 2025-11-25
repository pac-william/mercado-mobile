import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getRelativeTime } from "../../utils/dateUtils";

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
  const paperTheme = useTheme();
  const [notifications] = useState<Notification[]>(mockNotifications);

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
            backgroundColor: paperTheme.colors.surface,
            borderLeftColor: item.read ? 'transparent' : paperTheme.colors.primary,
            shadowColor: paperTheme.colors.modalShadow,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: paperTheme.colors.surfaceVariant }
          ]}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={24}
              color={paperTheme.colors.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: paperTheme.colors.onSurface,
                    fontWeight: item.read ? 'normal' : 'bold',
                  },
                ]}
              >
                {item.title}
              </Text>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: paperTheme.colors.primary }]} />
              )}
            </View>
            <Text
              style={[
                styles.message,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text
              style={[
                styles.time,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {getRelativeTime(item.time.toISOString())}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: paperTheme.colors.onBackground }]}>
            Notificações
          </Text>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 100,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

