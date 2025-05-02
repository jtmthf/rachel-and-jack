'use client';

import * as Form from '@radix-ui/react-form';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { useFormStatus } from 'react-dom';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Button } from './button';

type FormContextValue = {
  errors: Record<string, string | undefined>;
  success: boolean;
};

const FormContext = React.createContext<FormContextValue>({
  errors: {},
  success: false,
});

const FormControl = Form.Control;
const FormValidityState = Form.ValidityState;

function FormMessage({
  className,
  ...props
}: React.ComponentProps<typeof Form.Message>) {
  return (
    <Form.Message
      data-slot="form-message"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

type FormRootProps = Omit<React.ComponentProps<typeof Form.Root>, 'action'> & {
  action: (
    state: FormContextValue,
    formData: FormData,
  ) => Promise<FormContextValue>;
};

function FormRoot({ action, ...props }: FormRootProps) {
  const [state, formAction] = React.useActionState(action, {
    errors: {},
    success: false,
  });

  return (
    <FormContext.Provider value={state}>
      <Form.Root data-slot="form-root" action={formAction} {...props} />
    </FormContext.Provider>
  );
}

function FormField({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Form.Field>) {
  const state = React.useContext(FormContext);

  return (
    <Form.Field
      data-slot="form-field"
      className={cn(
        'data-[invalid]:*:data-[slot=form-message]:text-destructive grid gap-2',
        className,
      )}
      serverInvalid={Boolean(state.errors[props.name])}
      {...props}
    >
      {children}
      {state.errors[props.name] && (
        <FormMessage>{state.errors[props.name]}</FormMessage>
      )}
    </Form.Field>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Form.Label asChild>
      <Label
        data-slot="form-label"
        className={cn('data-[invalid]:text-destructive', className)}
        {...props}
      />
    </Form.Label>
  );
}

type FormSubmitProps = React.ComponentProps<typeof Button> & {
  onSubmitSuccess?: () => void;
  onSubmitError?: () => void;
};

function FormSubmit({
  className,
  children,
  onSubmitSuccess,
  onSubmitError,
  ...props
}: FormSubmitProps) {
  const status = useFormStatus();
  const state = React.useContext(FormContext);

  React.useEffect(() => {
    if (status.pending) return;

    if (state.success) {
      onSubmitSuccess?.();
    } else {
      onSubmitError?.();
    }
  }, [status.pending, state.success, props]);

  return (
    <Form.Submit asChild>
      <Button
        data-slot="form-submit"
        className={cn('mt-4', className)}
        {...props}
      >
        {status.pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    </Form.Submit>
  );
}

export {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormRoot,
  FormSubmit,
  FormValidityState,
};
