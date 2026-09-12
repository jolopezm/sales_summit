<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (amount: number) => Promise<void>;
  }

  let { open, onClose, onSave }: Props = $props();
  let dialog = $state<HTMLDialogElement>();
  let amountInput = $state<HTMLInputElement>();
  let amountText = $state("");
  let error = $state("");
  let saving = $state(false);

  $effect(() => {
    if (open && dialog && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => amountInput?.focus());
    }
    if (!open && dialog?.open) dialog.close();
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = "";

    const amount = Number(amountText.replace(/\D/g, ""));

    if (!amount || !Number.isSafeInteger(amount) || amount <= 0) {
      error = "Ingresa un monto válido, sin decimales.";
      return;
    }

    saving = true;
    try {
      await onSave(amount);
      amountText = "";
      onClose();
    } catch {
      error = "No pudimos guardar la venta. Intenta nuevamente.";
    } finally {
      saving = false;
    }
  }

  const amountFormatter = new Intl.NumberFormat("es-CL");

  function updateAmount(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "");

    amountText = digits ? amountFormatter.format(Number(digits)) : "";
  }
</script>

<dialog
  bind:this={dialog}
  aria-labelledby="new-sale-title"
  onclose={onClose}
  onclick={(event) => event.target === dialog && onClose()}
>
  <form onsubmit={submit}>
    <h2 id="new-sale-title">Nueva venta</h2>
    <label for="sale-amount">Monto de la venta</label>
    <div class="money-input">
      <span aria-hidden="true">$</span>
      <input
        type="text"
        inputmode="numeric"
        value={amountText}
        oninput={updateAmount}
        placeholder="0"
        required
      />
    </div>
    {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    <div class="dialog-actions">
      <button type="button" onclick={onClose}>Cancelar</button>
      <button class="btn-primary" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar venta"}
      </button>
    </div>
  </form>
</dialog>
