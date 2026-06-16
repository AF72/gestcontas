'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { createAccount } from '@/app/(app)/accounts/actions'
import { Plus } from 'lucide-react'

export function AccountForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createAccount(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Conta criada.')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="icon" className="bg-indigo-600 hover:bg-indigo-700" />}>
        <Plus className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name">Nome da conta</Label>
            <Input id="name" name="name" placeholder="Ex: Conta Principal" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="account_number">Número de conta</Label>
            <Input id="account_number" name="account_number" placeholder="Ex: PT50 0002 0123..." required className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'A criar...' : 'Criar Conta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
