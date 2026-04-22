// ============================================
// LAIKITA - Create Treatment (Optimizado)
// Calendario web + lista desplegable de horas
// ============================================

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import FormScreen from '@/components/ui/FormScreen';
import FormBuilder from '@/components/ui/FormBuilder';
import { buildTreatmentFields } from '@/constants/FormFields';
import Button from '@/components/ui/Button';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateToDisplay(dateString: string) {
  if (!dateString) return 'Seleccionar fecha';

  const parsed = new Date(`${dateString}T00:00:00`);
  if (isNaN(parsed.getTime())) return dateString;

  return parsed.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function generateTimeSlots(startHour = 8, endHour = 20, intervalMinutes = 30) {
  const slots: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      if (hour === endHour && minutes > 0) break;

      const hh = String(hour).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }

  return slots;
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayIndex = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: Array<Date | null> = [];

  for (let i = 1; i < firstDayIndex; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDay(date: Date) {
  const today = new Date();
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return current < todayOnly;
}

export default function CreateTreatmentScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user } = useAuth();
  const { pets, owners, addTreatment } = useData();

  const [values, setValues] = useState<Record<string, string>>({
    petId: '',
    type: 'consultation',
    title: '',
    description: '',
    date: '',
    time: '',
    cost: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [timeVisible, setTimeVisible] = useState(false);
  const [monthCursor, setMonthCursor] = useState(new Date());

  const timeSlots = useMemo(() => generateTimeSlots(8, 20, 30), []);
  const calendarDays = useMemo(() => buildCalendarDays(monthCursor), [monthCursor]);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSave = async () => {
    if (!values.petId || !values.title || !values.date || !values.time) {
      const msg = 'Mascota, título, fecha y hora son obligatorios';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    const selectedPet = pets.find(p => p.id === values.petId);
    if (!selectedPet) {
      const msg = 'Debes seleccionar una mascota válida';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    setSaving(true);

    try {
      await addTreatment({
        petId: values.petId,
        ownerId: selectedPet.ownerId,
        type: values.type as any,
        title: values.title,
        description: values.description,
        status: 'scheduled',
        date: values.date,
        time: values.time,
        veterinarian: user?.name || 'Veterinario',
        cost: parseFloat(values.cost) || 0,
      });

      const msg = 'La cita fue agendada exitosamente';
      Platform.OS === 'web'
        ? (window.alert(msg), router.back())
        : Alert.alert('Cita creada', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      const errMsg = error.message || 'No se pudo crear la cita';
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FormScreen
        title="Nueva Cita"
        icon="medical"
        iconColor={Colors.accent}
        iconBgColor={Colors.accentSoft}
        submitLabel="Agendar cita"
        onSubmit={handleSave}
        loading={saving}
      >
        <FormBuilder
          fields={buildTreatmentFields(pets, owners).filter(
            field => field.key !== 'date' && field.key !== 'time'
          )}
          values={values}
          errors={errors}
          onChange={onChange}
          openPicker={openPicker}
          onTogglePicker={setOpenPicker}
        />

        <View style={styles.customSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Fecha *</Text>

          <TouchableOpacity
            style={[
              styles.selectorButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
              },
            ]}
            onPress={() => setCalendarVisible(true)}
          >
            <View style={styles.selectorLeft}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text
                style={[
                  styles.selectorText,
                  { color: values.date ? theme.text : theme.textSecondary },
                ]}
              >
                {formatDateToDisplay(values.date)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.customSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Hora *</Text>

          <TouchableOpacity
            style={[
              styles.selectorButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
              },
            ]}
            onPress={() => setTimeVisible(true)}
          >
            <View style={styles.selectorLeft}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text
                style={[
                  styles.selectorText,
                  { color: values.time ? theme.text : theme.textSecondary },
                ]}
              >
                {values.time || 'Seleccionar hora'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </FormScreen>

      {/* Modal calendario */}
      <Modal transparent visible={calendarVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() =>
                  setMonthCursor(
                    new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
                  )
                }
              >
                <Ionicons name="chevron-back-outline" size={22} color={theme.text} />
              </TouchableOpacity>

              <Text style={[styles.calendarTitle, { color: theme.text }]}>
                {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setMonthCursor(
                    new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                  )
                }
              >
                <Ionicons name="chevron-forward-outline" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day, idx) => (
                <Text key={`${day}-${idx}`} style={[styles.weekDay, { color: theme.textSecondary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysWrap}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const selected = sameDay(day, values.date ? new Date(`${values.date}T00:00:00`) : null);
                const disabled = isPastDay(day);

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      styles.dayButton,
                      {
                        backgroundColor: selected ? Colors.primary : 'transparent',
                        opacity: disabled ? 0.4 : 1,
                      },
                    ]}
                    disabled={disabled}
                    onPress={() => {
                      onChange('date', formatDateToYYYYMMDD(day));
                      setCalendarVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? '#FFF' : theme.text,
                        fontWeight: selected ? '700' : '500',
                      }}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Cerrar"
              onPress={() => setCalendarVisible(false)}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal horas */}
      <Modal transparent visible={timeVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <Text style={[styles.calendarTitle, { color: theme.text, marginBottom: 16 }]}>
              Selecciona la hora
            </Text>

            <ScrollView style={{ maxHeight: 360 }}>
              {timeSlots.map(slot => {
                const selected = values.time === slot;

                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeOption,
                      {
                        backgroundColor: selected ? Colors.primarySoft : theme.background,
                        borderColor: selected ? Colors.primary : theme.borderLight,
                      },
                    ]}
                    onPress={() => {
                      onChange('time', slot);
                      setTimeVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        { color: selected ? Colors.primary : theme.text },
                      ]}
                    >
                      {slot}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="Cerrar"
              onPress={() => setTimeVisible(false)}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  customSection: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '700',
    marginBottom: 10,
  },
  selectorButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    maxHeight: '85%',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 42,
  },
  dayButton: {
    borderRadius: 12,
  },
  timeOption: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});