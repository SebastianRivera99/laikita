// ============================================
// LAIKITA - Create Owner (Optimizado)
// Usa FormBuilder + FormScreen
// ============================================

import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useData } from '@/context/DataContext';
import { validateOwnerForm } from '@/utils/validators';
import { ownerFields } from '@/constants/FormFields';
import FormScreen from '@/components/ui/FormScreen';
import FormBuilder from '@/components/ui/FormBuilder';

export default function CreateOwnerScreen() {
  const router = useRouter();
  const { addOwner } = useData();

  const [values, setValues] = useState<Record<string, string>>({
    firstName: '', lastName: '', email: '',
    phone: '', address: '', document: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSave = async () => {
    const validationErrors = validateOwnerForm(values);
    if (validationErrors.length > 0) {
      const errMap: Record<string, string> = {};
      validationErrors.forEach(e => (errMap[e.field] = e.message));
      setErrors(errMap);
      return;
    }
    setSaving(true);
    try {
      await addOwner({ ...values, avatar: undefined } as any);
      const msg = `${values.firstName} ${values.lastName} fue registrado exitosamente`;
      Platform.OS === 'web' ? (window.alert(msg), router.back()) : Alert.alert('Dueño creado', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      const errMsg = error.message || 'No se pudo crear el dueño';
      Platform.OS === 'web' ? window.alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen
      title="Nuevo Dueño"
      icon="person-add"
      iconColor={Colors.primary}
      iconBgColor={Colors.primarySoft}
      submitLabel="Guardar dueño"
      onSubmit={handleSave}
      loading={saving}
    >
      <FormBuilder fields={ownerFields} values={values} errors={errors} onChange={onChange} />
    </FormScreen>
  );
}
