import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export type NavTab = 'home' | 'alerts' | 'plan-day' | 'wellness' | 'profile';

const TABS: { key: NavTab; icon: string; label: string; route: string }[] = [
  { key: 'home',      icon: 'home',                 label: 'Inicio',    route: '/'             },
  { key: 'alerts',    icon: 'notifications',         label: 'Alertas',   route: '/alerts'       },
  { key: 'plan-day',  icon: 'event',                 label: 'Mi Día',    route: '/plan-day'     },
  { key: 'wellness',  icon: 'spa',                   label: 'Bienestar', route: '/wellness-mode' },
  { key: 'profile',   icon: 'account-circle',        label: 'Perfil',    route: '/profile'      },
];

interface Props {
  active: NavTab;
}

export default function BottomNavBar({ active }: Props) {
  return (
    <View style={styles.nav}>
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => !isActive && router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? '#185FA5' : '#94a3b8'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#C5CDD8',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#EBF3FF',
  },
  label: {
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  labelActive: {
    color: '#185FA5',
    fontWeight: '700',
  },
});
