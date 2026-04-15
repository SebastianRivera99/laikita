// ============================================
// LAIKITA - Create Treatment (Optimizado)
// ============================================

import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { buildTreatmentFields } from '@/constants/FormFields';
import FormScreen from '@/components/ui/FormScreen';
import FormBuilder from '@/components/ui/FormBuilder';

export default function CreateTreatmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pets, owners, addTreatment } = useData();

  const [values, setValues] = useState<Record<string, string>>({
    petId: '', type: 'consultation', title: '',
    description: '', date: '', time: '', cost: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSave = async () => {
    if (!values.petId || !values.title || !values.date || !values.time) {
      const msg = 'Mascota, título, fecha y hora son obligatorios';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    const selectedPet = pets.find(p => p.id === values.petId);
    if (!selectedPet) return;

    setSaving(true);
    try {
      await addTreatment({
        petId: values.petId, ownerId: selectedPet.ownerId,
        type: values.type as any, title: values.title,
        description: values.description, status: 'scheduled',
        date: values.date, time: values.time,
        veterinarian: user?.name || 'Veterinario',
        cost: parseFloat(values.cost) || 0,
      });
      const msg = 'La cita fue agendada exitosamente';
      Platform.OS === 'web' ? (window.alert(msg), router.back()) : Alert.alert('Cita creada', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      const errMsg = error.message || 'No se pudo crear la cita';
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
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
        fields={buildTreatmentFields(pets, owners)}
        values={values}
        errors={errors}
        onChange={onChange}
        openPicker={openPicker}
        onTogglePicker={setOpenPicker}
      />
    </FormScreen>
  );
}
