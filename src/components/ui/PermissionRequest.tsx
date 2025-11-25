import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { usePermissions } from '../../hooks/usePermissions';

type PermissionType = 'location' | 'camera' | 'mediaLibrary' | 'media' | 'notifications';

interface PermissionRequestProps {
  type: PermissionType;
  onGranted?: () => void;
  onDenied?: () => void;
  buttonText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  description?: string;
  showStatus?: boolean;
  autoRequest?: boolean;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  type,
  onGranted,
  onDenied,
  buttonText,
  icon,
  description,
  showStatus = false,
  autoRequest = false,
}) => {
  const paperTheme = usePaperTheme();
  const permissions = usePermissions();
  const [isRequesting, setIsRequesting] = useState(false);

  const getPermissionData = () => {
    switch (type) {
      case 'location':
        return {
          status: permissions.location.status,
          granted: permissions.location.granted,
          request: permissions.location.request,
          check: permissions.location.check,
          defaultIcon: 'location-outline' as keyof typeof Ionicons.glyphMap,
          defaultText: 'Usar minha localização',
          defaultDescription: 'Permitir acesso à localização para encontrar mercados próximos',
        };
      case 'camera':
        return {
          status: permissions.camera.status,
          granted: permissions.camera.granted,
          request: permissions.camera.request,
          check: permissions.camera.check,
          defaultIcon: 'camera-outline' as keyof typeof Ionicons.glyphMap,
          defaultText: 'Permitir câmera',
          defaultDescription: 'Permitir acesso à câmera para tirar foto de perfil',
        };
      case 'mediaLibrary':
        return {
          status: permissions.mediaLibrary.status,
          granted: permissions.mediaLibrary.granted,
          request: permissions.mediaLibrary.request,
          check: permissions.mediaLibrary.check,
          defaultIcon: 'images-outline' as keyof typeof Ionicons.glyphMap,
          defaultText: 'Permitir galeria',
          defaultDescription: 'Permitir acesso à galeria para escolher foto de perfil',
        };
      case 'media':
        return {
          status: permissions.media.granted ? 'granted' : permissions.media.camera === 'granted' || permissions.media.mediaLibrary === 'granted' ? 'denied' : 'undetermined',
          granted: permissions.media.granted,
          request: permissions.media.request,
          check: permissions.media.check,
          defaultIcon: 'camera-outline' as keyof typeof Ionicons.glyphMap,
          defaultText: 'Permitir câmera e galeria',
          defaultDescription: 'Permitir acesso à câmera e galeria para escolher ou tirar foto',
        };
      case 'notifications':
        return {
          status: permissions.notifications.status,
          granted: permissions.notifications.granted,
          request: permissions.notifications.request,
          check: permissions.notifications.check,
          defaultIcon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
          defaultText: 'Permitir notificações',
          defaultDescription: 'Permitir notificações para receber atualizações de pedidos',
        };
    }
  };

  const permissionData = getPermissionData();

  const getLoadingState = () => {
    switch (type) {
      case 'location':
        return permissions.location.loading;
      case 'camera':
        return permissions.camera.loading;
      case 'mediaLibrary':
        return permissions.mediaLibrary.loading;
      case 'media':
        return permissions.media.loading;
      case 'notifications':
        return permissions.notifications.loading;
      default:
        return false;
    }
  };

  const handleRequest = useCallback(async () => {
    if (permissionData.granted) {
      onGranted?.();
      return;
    }

    if (getLoadingState()) {
      return;
    }

    setIsRequesting(true);
    try {
      const granted = await permissionData.request();
      if (granted) {
        onGranted?.();
      } else {
        onDenied?.();
      }
    } catch (error) {
      onDenied?.();
    } finally {
      setIsRequesting(false);
    }
  }, [permissionData, onGranted, onDenied, type, permissions]);

  useEffect(() => {
    if (autoRequest && !permissionData.granted && permissionData.status === 'undetermined') {
      handleRequest();
    }
  }, [autoRequest, permissionData.granted, permissionData.status, handleRequest]);

  const getStatusColor = () => {
    if (permissionData.granted) {
      return paperTheme.colors.primary;
    }
    if (permissionData.status === 'denied' || permissionData.status === 'blocked') {
      return paperTheme.colors.error;
    }
    return paperTheme.colors.outline;
  };

  const getStatusText = () => {
    if (permissionData.granted) {
      return 'Permitido';
    }
    if (permissionData.status === 'denied' || permissionData.status === 'blocked') {
      return 'Negado';
    }
    return 'Não solicitado';
  };

  if (permissionData.granted && !showStatus) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: permissionData.granted
              ? paperTheme.colors.surfaceVariant
              : paperTheme.colors.surface,
            borderColor: getStatusColor(),
            shadowColor: paperTheme.colors.modalShadow,
          },
        ]}
        onPress={handleRequest}
        disabled={isRequesting || permissionData.granted || getLoadingState()}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {(isRequesting || getLoadingState()) ? (
              <ActivityIndicator size="small" color={paperTheme.colors.primary} />
            ) : (
              <Ionicons
                name={icon || permissionData.defaultIcon}
                size={24}
                color={permissionData.granted ? paperTheme.colors.primary : getStatusColor()}
              />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.buttonText,
                {
                  color: permissionData.granted
                    ? paperTheme.colors.primary
                    : paperTheme.colors.onSurface,
                },
              ]}
            >
              {buttonText || permissionData.defaultText}
            </Text>
            {description && (
              <Text
                style={[
                  styles.description,
                  {
                    color: paperTheme.colors.onSurface,
                    opacity: 0.7,
                  },
                ]}
              >
                {description || permissionData.defaultDescription}
              </Text>
            )}
            {showStatus && (
              <Text
                style={[
                  styles.statusText,
                  {
                    color: getStatusColor(),
                  },
                ]}
              >
                {getStatusText()}
              </Text>
            )}
          </View>
          {permissionData.granted && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={paperTheme.colors.primary}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

