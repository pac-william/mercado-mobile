import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from '../../constants/styles';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { MarketOperatingHoursResponse, OpeningHours } from '../../services/marketService';
import { calculateMarketStatus } from '../../utils/format';

interface OpeningHoursModalProps {
  visible: boolean;
  onClose: () => void;
  marketName: string;
  openingHours: MarketOperatingHoursResponse | null;
}

const OpeningHoursModal: React.FC<OpeningHoursModalProps> = ({
  visible,
  onClose,
  marketName,
  openingHours,
}) => {
  const paperTheme = useCustomTheme();
  
  // Calcula o status atual do mercado
  const marketStatus = calculateMarketStatus(openingHours);

  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Debug: log dos horários recebidos
  React.useEffect(() => {
   
  }, [visible, openingHours]);

  const formatTime = (time: string) => {
    return time;
  };

  const formatHolidayDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderDayHours = (hour: OpeningHours, index: number) => {
    // Se for feriado, exibe a data do feriado
    if (hour.isHoliday && hour.holidayDate) {
      const holidayDate = formatHolidayDate(hour.holidayDate);
      const uniqueKey = `holiday-${hour.holidayDate}-${index}`;
      
      return (
        <View
          key={uniqueKey}
          style={[
            styles.dayRow,
            { borderBottomColor: paperTheme.colors.outline },
          ]}
        >
          <View style={styles.holidayContainer}>
            <Ionicons name="calendar" size={ICON_SIZES.sm} color={paperTheme.colors.primary} />
            <Text style={[styles.dayName, { color: paperTheme.colors.onSurface }]}>
              {holidayDate} (Feriado)
            </Text>
          </View>
          <Text
            style={[
              styles.dayHours,
              {
                color: hour.isClosed
                  ? paperTheme.colors.error
                  : paperTheme.colors.onSurface,
              },
            ]}
          >
            {hour.isClosed
              ? 'Fechado'
              : hour.openTime && hour.closeTime
              ? `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`
              : 'Horário não disponível'}
          </Text>
        </View>
      );
    }

    // Horários regulares (não feriados)
    if (hour.dayOfWeek === null || hour.dayOfWeek === undefined) {
      return null; // Ignora itens sem dayOfWeek que não são feriados
    }

    // Garante que dayOfWeek está no range válido (0-6)
    const dayIndex = hour.dayOfWeek >= 0 && hour.dayOfWeek <= 6 ? hour.dayOfWeek : 0;
    const dayName = days[dayIndex];
    // Cria uma chave única combinando dayOfWeek com índice e horários
    const uniqueKey = `${hour.dayOfWeek}-${hour.openTime || 'closed'}-${hour.closeTime || 'closed'}-${index}`;
    
    return (
      <View
        key={uniqueKey}
        style={[
          styles.dayRow,
          { borderBottomColor: paperTheme.colors.outline },
        ]}
      >
        <Text style={[styles.dayName, { color: paperTheme.colors.onSurface }]}>
          {dayName}
        </Text>
        <Text
          style={[
            styles.dayHours,
            {
              color: hour.isClosed
                ? paperTheme.colors.error
                : paperTheme.colors.onSurface,
            },
          ]}
        >
          {hour.isClosed
            ? 'Fechado'
            : hour.openTime && hour.closeTime
            ? `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`
            : 'Horário não disponível'}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: paperTheme.colors.modalOverlay }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: paperTheme.colors.surface,
              shadowColor: paperTheme.colors.modalShadow,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: paperTheme.colors.outline }]}>
            <View style={styles.headerContent}>
              <Ionicons
                name="time"
                size={ICON_SIZES.xl}
                color={paperTheme.colors.primary}
              />
              <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>
                Horário de Funcionamento
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={ICON_SIZES.xl}
                color={paperTheme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Market Name */}
          <View style={styles.marketNameContainer}>
            <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]}>
              {marketName}
            </Text>
            {openingHours && (
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: marketStatus.isOpen
                        ? paperTheme.colors.primaryContainer
                        : paperTheme.colors.errorContainer,
                    },
                  ]}
                >
                  <Ionicons
                    name={marketStatus.isOpen ? 'checkmark-circle' : 'close-circle'}
                    size={ICON_SIZES.md}
                    color={
                      marketStatus.isOpen
                        ? paperTheme.colors.primary
                        : paperTheme.colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: marketStatus.isOpen
                          ? paperTheme.colors.primary
                          : paperTheme.colors.error,
                      },
                    ]}
                  >
                    {marketStatus.statusText}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={true}
            indicatorStyle={paperTheme.dark ? 'white' : 'default'}
          >
            {openingHours ? (
              openingHours.is24Hours ? (
                <View style={styles.hoursContainer}>
                  <View style={styles.hours24Container}>
                    <Ionicons
                      name="time"
                      size={ICON_SIZES.xxxl}
                      color={paperTheme.colors.primary}
                    />
                    <Text style={[styles.hours24Text, { color: paperTheme.colors.onSurface }]}>
                      Este mercado funciona 24 horas por dia, todos os dias da semana.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.hoursContainer}>
                  <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface, marginBottom: SPACING.lg }]}>
                    Horários de Funcionamento
                  </Text>
                  
                  {/* Lista TODOS os dias da semana (0-6), sempre */}
                  {days.map((dayName, dayIndex) => {
                    // Busca horários para este dia (não feriados)
                    const dayHours = openingHours.hours 
                      ? openingHours.hours.filter(
                          hour => hour.dayOfWeek === dayIndex && !hour.isHoliday
                        )
                      : [];

                    // Se não houver horário cadastrado para este dia, mostra como fechado
                    if (dayHours.length === 0) {
                      return (
                        <View
                          key={`day-${dayIndex}`}
                          style={[
                            styles.dayRow,
                            { borderBottomColor: paperTheme.colors.outline },
                          ]}
                        >
                          <Text style={[styles.dayName, { color: paperTheme.colors.onSurface }]}>
                            {dayName}
                          </Text>
                          <Text
                            style={[
                              styles.dayHours,
                              { color: paperTheme.colors.onSurfaceVariant, opacity: 0.7 },
                            ]}
                          >
                            Fechado
                          </Text>
                        </View>
                      );
                    }

                    // Se houver múltiplos horários no mesmo dia, exibe todos
                    return dayHours.map((hour, hourIndex) => {
                      const uniqueKey = `${dayIndex}-${hour.openTime || 'closed'}-${hour.closeTime || 'closed'}-${hourIndex}`;
                      return (
                        <View
                          key={uniqueKey}
                          style={[
                            styles.dayRow,
                            { borderBottomColor: paperTheme.colors.outline },
                          ]}
                        >
                          <Text style={[styles.dayName, { color: paperTheme.colors.onSurface }]}>
                            {dayName}
                          </Text>
                          <Text
                            style={[
                              styles.dayHours,
                              {
                                color: hour.isClosed
                                  ? paperTheme.colors.error
                                  : paperTheme.colors.onSurface,
                                fontWeight: hour.isClosed ? '400' : '500',
                              },
                            ]}
                          >
                            {hour.isClosed
                              ? 'Fechado'
                              : hour.openTime && hour.closeTime
                              ? `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`
                              : 'Horário não disponível'}
                          </Text>
                        </View>
                      );
                    });
                  })}
                  
                  {/* Feriados */}
                  {openingHours.hours && openingHours.hours.some(hour => hour.isHoliday) && (
                    <>
                      <View style={[styles.sectionDivider, { backgroundColor: paperTheme.colors.outline, marginTop: SPACING.lg }]} />
                      <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurfaceVariant, marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                        Feriados
                      </Text>
                      {openingHours.hours
                        .filter(hour => hour.isHoliday)
                        .slice()
                        .sort((a, b) => {
                          const dateA = a.holidayDate ? new Date(a.holidayDate).getTime() : 0;
                          const dateB = b.holidayDate ? new Date(b.holidayDate).getTime() : 0;
                          return dateA - dateB;
                        })
                        .map((hour, index) => renderDayHours(hour, index))
                        .filter(item => item !== null)}
                    </>
                  )}
                </View>
              )
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="time-outline"
                  size={ICON_SIZES.xxxl}
                  color={paperTheme.colors.onSurfaceVariant}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  Horário de funcionamento não disponível
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  marketNameContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  marketName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  hoursContainer: {
    padding: SPACING.lg,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  dayName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    flex: 1,
  },
  dayHours: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
  },
  emptyContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  hours24Container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  hours24Text: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '500',
  },
  holidayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionDivider: {
    height: 1,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
});

export default OpeningHoursModal;

