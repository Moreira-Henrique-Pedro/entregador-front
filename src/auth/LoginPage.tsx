import { Alert, Anchor, Button, Center, Group, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconMailCheck, IconPackage } from '@tabler/icons-react'
import { useState } from 'react'
import { passwordResetErrorMessage, signInErrorMessage } from './authClient'
import { useAuth } from './useAuth'

const validEmail = (value: string) => (/^\S+@\S+$/.test(value.trim()) ? null : 'Informe um e-mail válido')

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')

  return (
    <Center mih="100vh" p="md">
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={380}>
        <Stack>
          <Stack gap={4} align="center">
            <IconPackage size={36} />
            <Title order={3}>Entregador</Title>
          </Stack>
          {mode === 'login' ? (
            <LoginForm
              initialEmail={email}
              onForgotPassword={(typed) => {
                setEmail(typed)
                setMode('reset')
              }}
            />
          ) : (
            <PasswordResetForm initialEmail={email} onBack={() => setMode('login')} />
          )}
        </Stack>
      </Paper>
    </Center>
  )
}

function LoginForm({ initialEmail, onForgotPassword }: { initialEmail: string; onForgotPassword: (email: string) => void }) {
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({
    initialValues: { email: initialEmail, password: '' },
    validate: {
      email: validEmail,
      password: (value) => (value ? null : 'Informe a senha'),
    },
  })

  const submit = form.onSubmit(async ({ email, password }) => {
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(signInErrorMessage(err))
      setSubmitting(false)
    }
  })

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={18} />}>
            {error}
          </Alert>
        )}

        <TextInput label="E-mail" type="email" autoComplete="username" required {...form.getInputProps('email')} />
        <PasswordInput label="Senha" autoComplete="current-password" required {...form.getInputProps('password')} />
        <Button type="submit" loading={submitting} fullWidth>
          Entrar
        </Button>
        <Group justify="center">
          <Anchor component="button" type="button" size="sm" onClick={() => onForgotPassword(form.values.email.trim())}>
            Esqueceu a senha?
          </Anchor>
        </Group>
      </Stack>
    </form>
  )
}

function PasswordResetForm({ initialEmail, onBack }: { initialEmail: string; onBack: () => void }) {
  const { sendPasswordReset } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({ initialValues: { email: initialEmail }, validate: { email: validEmail } })

  const submit = form.onSubmit(async ({ email }) => {
    setError(null)
    setSubmitting(true)
    try {
      await sendPasswordReset(email.trim())
      setSentTo(email.trim())
    } catch (err) {
      setError(passwordResetErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  })

  const back = (
    <Group justify="center">
      <Anchor component="button" type="button" size="sm" onClick={onBack}>
        Voltar para o login
      </Anchor>
    </Group>
  )

  if (sentTo) {
    return (
      <Stack>
        <Alert color="teal" icon={<IconMailCheck size={18} />} title="Verifique seu e-mail">
          Se {sentTo} estiver cadastrado, você vai receber um link para criar uma nova senha. Confira também a caixa de spam.
        </Alert>
        {back}
      </Stack>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <Text size="sm" c="dimmed">
          Informe o e-mail de login. Enviaremos um link para você criar uma nova senha.
        </Text>
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={18} />}>
            {error}
          </Alert>
        )}
        <TextInput label="E-mail" type="email" autoComplete="username" required {...form.getInputProps('email')} />
        <Button type="submit" loading={submitting} fullWidth>
          Enviar link
        </Button>
        {back}
      </Stack>
    </form>
  )
}
