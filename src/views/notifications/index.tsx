import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getRelativeTime } from "../../utils/dateUtils";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { SPACING, FONT_SIZE, BORDER_RADIUS, ICON_SIZES, SHADOWS } from "../../constants/styles";
import { notificationService, type Notification } from "../../services/notificationService";
import { useSession } from "../../hooks/useSession";
import LoadingScreen from "../../components/ui/LoadingScreen";

type NotificationsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "Notifications">;

function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { isAuthenticated } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isLoadingRef.current && !append) {
      return;
    }

    try {
      isLoadingRef.current = true;
      if (!append) {
        setError(null);
        setLoading(true);
      }

      const result = await notificationService.getNotifications({
        page: pageNum,
        size: 20,
      });

      if(!result) {
        return;
      }

      if (append) {
        setNotifications(prev => [...prev, ...result.notifications]);
      } else {
        setNotifications(result.notifications);
        hasLoadedRef.current = true;
      }

      setHasMore(result.pagination.page < result.pagination.totalPages);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setError(err?.message || 'Erro ao carregar notificações');
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current && !isLoadingRef.current) {
      loadNotifications(1, false);
    } else if (!isAuthenticated) {
      setLoading(false);
      setNotifications([]);
      hasLoadedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      // Apenas recarregar se não estiver carregando e já tiver carregado antes
      if (isAuthenticated && hasLoadedRef.current && !isLoadingRef.current) {
        loadNotifications(1, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadNotifications(1, false);
  }, [loadNotifications]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage, true);
    }
  }, [loading, hasMore, refreshing, page, loadNotifications]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      const success = await notificationService.markAsRead(notification.id);
      if (success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }
    }

    const data = notification.data as any;
    const orderId =
      data?.orderId ||
      data?.order_id ||
      data?.orderID;

    if (orderId) {
      const parentNav: any = (navigation as any).getParent?.();
      if (parentNav) {
        parentNav.navigate('SettingsStack', {
          screen: 'OrderDetail',
          params: { orderId: String(orderId) },
        });
      }
    }
  }, [navigation, setNotifications]);

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
      paddingBottom: 10,
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
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: SPACING.jumbo + SPACING.xxxl,
    },
    errorText: {
      fontSize: FONT_SIZE.md,
      marginTop: SPACING.md,
      color: theme.colors.error,
      textAlign: "center",
    },
    loadingMore: {
      paddingVertical: SPACING.lg,
    },
  }));

  const getNotificationIcon = (type: string) => {
    if (type === 'order') return 'receipt-outline';
    if (type === 'system') return 'information-circle-outline';
    return 'notifications-outline';
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    if (!item || !item.id) {
      return null;
    }

    const title = item.title || 'Notificação';
    const message = item.message || '';
    const type = item.type || 'system';
    const isRead = item.read || false;
    
    let timeText = 'Agora';
    if (item.time && item.time instanceof Date && !isNaN(item.time.getTime())) {
      try {
        timeText = getRelativeTime(item.time.toISOString());
      } catch (error) {
        console.warn('Erro ao formatar data da notificação:', error);
        timeText = 'Agora';
      }
    }

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            borderLeftColor: isRead ? "transparent" : paperTheme.colors.primary,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(type) as any}
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
                  fontWeight: isRead ? "normal" : "bold",
                },
              ]}
            >
                {title}
              </Text>
              {!isRead && (
              <View style={styles.unreadDot} />
              )}
            </View>
          <Text
            style={styles.message}
            numberOfLines={2}
          >
              {message}
            </Text>
          <Text
            style={styles.time}
          >
              {timeText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={paperTheme.colors.primary} />
      </View>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        <LoadingScreen />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={ICON_SIZES.xxxl + ICON_SIZES.sm}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyText}>
            Faça login para ver suas notificações
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        {error && notifications.length === 0 ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={ICON_SIZES.xxxl + ICON_SIZES.sm}
              color={paperTheme.colors.error}
            />
            <Text style={styles.errorText}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={{ marginTop: SPACING.md }}
            >
              <Text style={{ color: paperTheme.colors.primary }}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[paperTheme.colors.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </View>
  );
}

export default NotificationsScreen;
