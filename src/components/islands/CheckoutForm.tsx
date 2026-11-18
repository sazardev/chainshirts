import { useSignal } from '@preact/signals';
import { cartTotalMinor } from '../../lib/domain/cart';
import { formatMoney } from '../../lib/domain/money';
import type { CheckoutInput } from '../../lib/domain/order';
import { validateCheckout } from '../../lib/domain/order';
import { discountFor, findPromo } from '../../lib/domain/promo';
import { clientHref } from '../../lib/paths';
import { placeOrder } from '../../lib/reactive/actions';
import { selectCart } from '../../lib/store/selectors';
import { Button } from './ui/Button';
import { Field, inputClass } from './ui/Field';
import { useStoreState } from './ui/use-store';

type FieldName = keyof CheckoutInput;

const FIELDS: { name: FieldName; label: string; help?: string; autocomplete: string }[] = [
  { name: 'fullName', label: 'Full name', autocomplete: 'name' },
  { name: 'address', label: 'Address', autocomplete: 'street-address' },
  { name: 'city', label: 'City', autocomplete: 'address-level2' },
  { name: 'postalCode', label: 'Postal code', autocomplete: 'postal-code' },
  {
    name: 'cardNumber',
    label: 'Card number',
    help: 'We accept all major cards.',
    autocomplete: 'cc-number',
  },
  {
    name: 'promoCode',
    label: 'Promo code',
    help: 'Try CHAOS15 for 15% off.',
    autocomplete: 'off',
  },
];

export default function CheckoutForm() {
  const state = useStoreState();
  const cart = selectCart(state, state.activeUserId);
  const total = cartTotalMinor(cart);

  const values = useSignal<CheckoutInput>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    promoCode: '',
  });
  const errors = useSignal<Partial<Record<FieldName, string>>>({});
  const touched = useSignal<Partial<Record<FieldName, boolean>>>({});
  const summary = useSignal(false);

  function validateAll(): boolean {
    const found = validateCheckout(values.value);
    const next: Partial<Record<FieldName, string>> = {};
    for (const issue of found) next[issue.field as FieldName] = issue.message;
    errors.value = next;
    summary.value = found.length >= 3;
    return found.length === 0;
  }

  function onSubmit(event: Event) {
    event.preventDefault();
    if (cart.items.length === 0) {
      errors.value = { address: 'Your cart is empty. Add an item before checking out.' };
      return;
    }
    if (!validateAll()) {
      const first = FIELDS.find((field) => errors.value[field.name]);
      if (first) document.getElementById(first.name)?.focus();
      return;
    }
    const order = placeOrder(values.value);
    if (order && typeof window !== 'undefined') {
      window.location.assign(
        clientHref(`/order-confirmation?order=${encodeURIComponent(order.id)}`),
      );
    }
  }

  return (
    <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} novalidate class="surface-card flex flex-col gap-5 p-5 sm:p-6">
        <div>
          <h2 class="text-heading-lg font-semibold text-text">Shipping details</h2>
          <p class="mt-1 text-body-sm text-muted">
            Complete your delivery details to place your order.
          </p>
        </div>

        {summary.value && (
          <div
            role="alert"
            class="rounded-md border border-danger bg-danger/10 p-4 text-body-md text-critical"
          >
            <p class="font-semibold">Check the highlighted fields before continuing.</p>
          </div>
        )}

        {FIELDS.map((field) => {
          const error = errors.value[field.name];
          return (
            <Field
              key={field.name}
              id={field.name}
              label={field.label}
              help={field.help}
              error={error}
            >
              <input
                id={field.name}
                name={field.name}
                type="text"
                inputmode={field.name === 'cardNumber' ? 'numeric' : undefined}
                autocomplete={field.autocomplete}
                maxLength={field.name === 'cardNumber' ? 19 : 160}
                value={values.value[field.name]}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                onBlur={() => {
                  touched.value = { ...touched.value, [field.name]: true };
                  if (touched.value[field.name]) validateAll();
                }}
                onInput={(event) => {
                  const next = {
                    ...values.value,
                    [field.name]: (event.currentTarget as HTMLInputElement).value,
                  };
                  values.value = next;
                  if (touched.value[field.name]) validateAll();
                }}
                class={inputClass}
              />
            </Field>
          );
        })}

        <Button type="submit" variant="primary" fullWidth>
          Place order · {formatMoney(total)}
        </Button>
      </form>

      <aside class="surface-card h-fit p-5" aria-labelledby="checkout-summary-heading">
        <h2 id="checkout-summary-heading" class="text-heading-lg font-semibold text-text">
          Order summary
        </h2>
        {cart.items.length === 0 ? (
          <p class="mt-3 text-body-md text-muted">Your cart is empty.</p>
        ) : (
          <ul class="mt-4 flex flex-col gap-3">
            {cart.items.map((item) => (
              <li
                key={`${item.productId}-${item.size}`}
                class="flex justify-between gap-3 text-body-md"
              >
                <span class="text-muted">
                  {item.name} × {item.quantity}
                </span>
                <span class="font-semibold tabular-nums">
                  {formatMoney(item.quantity * item.unitPriceMinor)}
                </span>
              </li>
            ))}
            {findPromo(values.value.promoCode) && (
              <li class="flex justify-between text-success">
                <span>{values.value.promoCode.trim().toUpperCase()} discount</span>
                <span class="tabular-nums">
                  −{formatMoney(discountFor(total, values.value.promoCode))}
                </span>
              </li>
            )}
            <li class="flex justify-between border-t border-border pt-3 text-body-lg font-bold">
              <span>Total</span>
              <span class="tabular-nums">
                {formatMoney(total - discountFor(total, values.value.promoCode))}
              </span>
            </li>
          </ul>
        )}
      </aside>
    </div>
  );
}
