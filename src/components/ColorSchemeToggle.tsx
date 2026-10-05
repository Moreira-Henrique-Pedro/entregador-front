import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const current = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const next = current === 'dark' ? 'light' : 'dark'

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label={next === 'dark' ? 'Usar tema escuro' : 'Usar tema claro'}
      onClick={() => setColorScheme(next)}
    >
      {next === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}
    </ActionIcon>
  )
}
