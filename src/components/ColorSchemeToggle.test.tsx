import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/render'
import { ColorSchemeToggle } from './ColorSchemeToggle'

describe('ColorSchemeToggle', () => {
  it('switches between light and dark', async () => {
    const { user } = renderWithProviders(<ColorSchemeToggle />)
    const html = document.documentElement

    await user.click(screen.getByRole('button', { name: 'Usar tema escuro' }))
    expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark')

    await user.click(screen.getByRole('button', { name: 'Usar tema claro' }))
    expect(html).toHaveAttribute('data-mantine-color-scheme', 'light')
  })
})
