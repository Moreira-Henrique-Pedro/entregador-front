import { Button, Group, Modal, Select, Stack } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import type { NewDelivery } from '../../api/types'
import { packageTypeOptions, residentOptions, urgencyOptions } from './labels'
import { useApartments, useCreateDelivery, useResidents } from './queries'

type NewDeliveryForm = Required<NewDelivery>

const emptyDelivery: NewDeliveryForm = { apartment: '', resident_id: '', package_type: '', urgency: '' }

export function NewDeliveryModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const createDelivery = useCreateDelivery()
  const apartments = useApartments()

  const form = useForm<NewDeliveryForm>({
    mode: 'controlled',
    initialValues: emptyDelivery,
    validate: {
      apartment: isNotEmpty('Selecione o apartamento'),
      resident_id: isNotEmpty('Selecione o morador'),
      package_type: isNotEmpty('Selecione o tipo do pacote'),
      urgency: isNotEmpty('Selecione a urgência'),
    },
  })

  const residents = useResidents(form.values.apartment)

  const close = () => {
    form.reset()
    onClose()
  }

  const submit = (delivery: NewDeliveryForm) =>
    createDelivery.mutate(delivery, {
      onSuccess: () => {
        notifications.show({ color: 'green', message: 'Entrega registrada. O morador será avisado pelo WhatsApp.' })
        close()
      },
      onError: (error) => notifications.show({ color: 'red', title: 'Não foi possível registrar', message: error.message }),
    })

  return (
    <Modal opened={opened} onClose={close} title="Nova entrega" fullScreen={isMobile} centered>
      <form onSubmit={form.onSubmit(submit)}>
        <Stack>
          <Select
            label="Apartamento"
            placeholder="Selecione"
            searchable
            data={apartments.data ?? []}
            disabled={apartments.isLoading}
            nothingFoundMessage="Nenhum apartamento com moradores"
            {...form.getInputProps('apartment')}
            onChange={(apartment) => {
              form.setFieldValue('apartment', apartment ?? '')
              form.setFieldValue('resident_id', '')
            }}
          />
          <Select
            label="Morador"
            placeholder={form.values.apartment ? 'Selecione' : 'Selecione o apartamento primeiro'}
            data={residentOptions(residents.data ?? [])}
            disabled={!form.values.apartment || residents.isLoading}
            {...form.getInputProps('resident_id')}
          />
          <Select label="Tipo do pacote" placeholder="Selecione" data={packageTypeOptions} {...form.getInputProps('package_type')} />
          <Select label="Urgência" placeholder="Selecione" data={urgencyOptions} {...form.getInputProps('urgency')} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" loading={createDelivery.isPending}>
              Registrar entrega
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
