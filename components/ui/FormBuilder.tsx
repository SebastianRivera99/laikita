// ============================================
// LAIKITA - FormBuilder Component
// Renderiza formularios a partir de un array
// de configuración. Un solo componente para
// todos los formularios de la app.
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import Input from './Input';

// ---- Tipos de campo soportados ----

export interface TextField {
  type: 'text';
  key: string;
  label: string;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboard?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  isPassword?: boolean;
  multiline?: boolean;
  half?: boolean; // Ocupa media fila (para poner 2 campos lado a lado)
}

export interface ChipField {
  type: 'chips';
  key: string;
  label: string;
  options: { key: string; label: string; emoji?: string; color?: string }[];
}

export interface PickerField {
  type: 'picker';
  key: string;
  label: string;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  options: { id: string; label: string }[];
}

export type FormField = TextField | ChipField | PickerField;

// ---- Props del FormBuilder ----

interface FormBuilderProps {
  fields: FormField[];
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  // Picker state (manejado desde fuera para poder abrir/cerrar)
  openPicker?: string | null;
  onTogglePicker?: (key: string | null) => void;
}

export default function FormBuilder({
  fields,
  values,
  errors = {},
  onChange,
  openPicker,
  onTogglePicker,
}: FormBuilderProps) {
  const theme = useThemeColors();

  // Agrupa campos "half" en filas de 2
  const renderFields = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < fields.length) {
      const field = fields[i];

      // Campos de media fila: busca el siguiente half
      if (field.type === 'text' && field.half && i + 1 < fields.length) {
        const next = fields[i + 1];
        if (next.type === 'text' && next.half) {
          elements.push(
            <View key={`row-${field.key}`} style={styles.row}>
              <View style={{ flex: 1 }}>{renderField(field)}</View>
              <View style={{ flex: 1 }}>{renderField(next)}</View>
            </View>
          );
          i += 2;
          continue;
        }
      }

      elements.push(<View key={field.key}>{renderField(field)}</View>);
      i++;
    }

    return elements;
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            label={field.label}
            icon={field.icon}
            placeholder={field.placeholder}
            value={values[field.key] || ''}
            onChangeText={(v) => onChange(field.key, v)}
            error={errors[field.key]}
            keyboardType={field.keyboard}
            autoCapitalize={field.autoCapitalize}
            isPassword={field.isPassword}
            multiline={field.multiline}
          />
        );

      case 'chips':
        return (
          <>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{field.label}</Text>
            <View style={styles.chipRow}>
              {field.options.map((opt) => {
                const active = values[field.key] === opt.key;
                const bgColor = active
                  ? (opt.color || Colors.primary)
                  : theme.surfaceSecondary;
                const borderColor = active
                  ? (opt.color || Colors.primary)
                  : theme.border;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.chip, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => onChange(field.key, opt.key)}
                  >
                    {opt.emoji && <Text style={styles.chipEmoji}>{opt.emoji}</Text>}
                    <Text style={[styles.chipText, { color: active ? '#FFF' : theme.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );

      case 'picker':
        const selectedOption = field.options.find((o) => o.id === values[field.key]);
        const isOpen = openPicker === field.key;
        return (
          <>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{field.label}</Text>
            <TouchableOpacity
              style={[styles.pickerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onTogglePicker?.(isOpen ? null : field.key)}
            >
              {field.icon && <Ionicons name={field.icon} size={20} color={theme.textTertiary} />}
              <Text style={[styles.pickerText, { color: selectedOption ? theme.text : theme.textTertiary }]}>
                {selectedOption ? selectedOption.label : field.placeholder}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
            {isOpen && (
              <View style={[styles.pickerList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {field.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.pickerItem, opt.id === values[field.key] && { backgroundColor: Colors.primarySoft }]}
                    onPress={() => {
                      onChange(field.key, opt.id);
                      onTogglePicker?.(null);
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: theme.text }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        );
    }
  };

  return <>{renderFields()}</>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  fieldLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Layout.spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    gap: 6,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    height: 50,
    gap: 10,
    marginBottom: Layout.spacing.md,
  },
  pickerText: { flex: 1, fontSize: Layout.fontSize.md },
  pickerList: {
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    marginTop: -12,
    marginBottom: Layout.spacing.md,
    overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerItemText: { fontSize: Layout.fontSize.md },
});
