// ============================================
// LAIKITA - Create Pet (Optimizado)
// ============================================

import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useData } from '@/context/DataContext';
import { buildPetFields } from '@/constants/FormFields';
import FormScreen from '@/components/ui/FormScreen';
import FormBuilder from '@/components/ui/FormBuilder';

export default function CreatePetScreen() {
  const router = useRouter();
  const { owners, addPet } = useData();

  const [values, setValues] = useState<Record<string, string>>({
    ownerId: '', name: '', species: 'dog', breed: '',
    gender: 'male', size: 'medium', weight: '',
    color: '', birthDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSave = async () => {
    if (!values.name || !values.breed || !values.ownerId) {
      const msg = 'Nombre, raza y dueño son obligatorios';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    setSaving(true);
    try {
      await addPet({
        name: values.name, species: values.species as any, breed: values.breed,
        gender: values.gender as any, size: values.size as any,
        weight: parseFloat(values.weight) || 0, color: values.color,
        birthDate: values.birthDate || '2023-01-01', ownerId: values.ownerId,
        isNeutered: false, allergies: [],
        photo: undefined, microchip: undefined, notes: undefined,
      });
      const msg = `${values.name} fue registrado(a) exitosamente`;
      Platform.OS === 'web' ? (window.alert(msg), router.back()) : Alert.alert('Mascota registrada', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      const errMsg = error.message || 'No se pudo registrar';
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen
      title="Nueva Mascota"
      icon="paw"
      iconColor={Colors.secondary}
      iconBgColor={Colors.secondarySoft}
      submitLabel="Registrar mascota"
      onSubmit={handleSave}
      loading={saving}
    >
      <FormBuilder
        fields={buildPetFields(owners)}
        values={values}
        errors={errors}
        onChange={onChange}
        openPicker={openPicker}
        onTogglePicker={setOpenPicker}
      />
    </FormScreen>
  );
}
