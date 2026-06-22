import { useState, useCallback } from 'react';
import type { ConfirmVariant } from '../components/ConfirmModal';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: ConfirmVariant;
  resolve: ((value: boolean) => void) | null;
}

const INITIAL: ConfirmState = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  variant: 'warning',
  resolve: null,
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(INITIAL);

  const confirm = useCallback(
    (opts: {
      title: string;
      message: string;
      confirmLabel?: string;
      variant?: ConfirmVariant;
    }): Promise<boolean> =>
      new Promise((resolve) => {
        setState({
          open: true,
          title: opts.title,
          message: opts.message,
          confirmLabel: opts.confirmLabel ?? 'Confirmar',
          variant: opts.variant ?? 'warning',
          resolve,
        });
      }),
    [],
  );

  const onConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(INITIAL);
  }, [state.resolve]);

  const onCancel = useCallback(() => {
    state.resolve?.(false);
    setState(INITIAL);
  }, [state.resolve]);

  return {
    confirm,
    confirmProps: {
      open: state.open,
      title: state.title,
      message: state.message,
      confirmLabel: state.confirmLabel,
      variant: state.variant,
      onConfirm,
      onCancel,
    },
  };
}
