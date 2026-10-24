'use client'

import { ArrowUpRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PARTNER_CONTACT_URL } from '@/lib/landing/partners'
import type { Landing } from '../types'

interface PartnerDialogProps {
  copy: Landing['closing']['partners']['dialog']
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Puts focus back on the card that opened the dialog. */
  onCloseAutoFocus: (event: Event) => void
}

/** "Become a partner" (D-69): a short note and a link to the owner's contact page, in a new tab. */
export function PartnerDialog({ copy, open, onOpenChange, onCloseAutoFocus }: PartnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={copy.close} onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <a className={buttonVariants()} href={PARTNER_CONTACT_URL} target="_blank" rel="noopener noreferrer">
            {copy.contact}{' '}
            <span className="sr-only">{copy.newTab}</span>
            <ArrowUpRight strokeWidth={1.6} aria-hidden="true" />
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
