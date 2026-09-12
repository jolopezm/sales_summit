<script lang="ts">
  import type { Sale } from "../domain/models";

  interface Props {
    sale: Sale | null;
    onClose: () => void;
    onSave: (sale: Sale, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }

  let { sale, onClose, onSave, onDelete }: Props = $props();
  let dialog = $state<HTMLDialogElement>();
  let amountInput = $state<HTMLInputElement>();
  let amountText = $state("");
  let error = $state("");
  let saving = $state(false);
  let confirmingDelete = $state(false);
  let loadedSaleId = $state<string | null>(null);

  const amountFormatter = new Intl.NumberFormat("es-CL");

  $effect(() => {
    if (sale && sale.id !== loadedSaleId) {
      loadedSaleId = sale.id;
      amountText = amountFormatter.format(sale.amount);
      error = "";
      confirmingDelete = false;
    }

    if (sale && dialog && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => amountInput?.focus());
    }

    if (!sale && dialog?.open) dialog.close();
    if (!sale) loadedSaleId = null;
  });

  function close() {
    if (saving) return;
    onClose();
  }

  function updateAmount(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "");

    amountText = digits ? amountFormatter.format(Number(digits)) : "";
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!sale) return;
    error = "";

    const amount = Number(amountText.replace(/\D/g, ""));
    if (!amount || !Number.isSafeInteger(amount) || amount <= 0) {
      error = "Ingresa un monto válido, sin decimales.";
      return;
    }

    saving = true;
    try {
      await onSave(sale, amount);
      onClose();
    } catch {
      error = "No pudimos guardar la venta. Intenta nuevamente.";
    } finally {
      saving = false;
    }
  }

  async function deleteSale() {
    if (!sale) return;
    error = "";
    saving = true;

    try {
      await onDelete(sale.id);
      onClose();
    } catch {
      error = "No pudimos eliminar la venta. Intenta nuevamente.";
    } finally {
      saving = false;
    }
  }

  function requestDelete() {
    error = "";
    confirmingDelete = true;
  }
</script>

<dialog
  bind:this={dialog}
  aria-labelledby="edit-sale-title"
  onclose={close}
  onclick={(event) => event.target === dialog && close()}
>
  {#if confirmingDelete}
    <section class="delete-confirmation">
      <h2 id="edit-sale-title">¿Estás seguro?</h2>
      {#if error}<p class="form-error" role="alert">{error}</p>{/if}
      <button
        class="btn-danger"
        type="button"
        disabled={saving}
        onclick={deleteSale}
      >
        {saving ? "Eliminando…" : "Confirmar eliminación"}
      </button>
      <button
        type="button"
        disabled={saving}
        onclick={() => (confirmingDelete = false)}
      >
        Cancelar
      </button>
    </section>
  {:else}
    <form onsubmit={submit}>
      <h2 id="edit-sale-title">Editar venta</h2>
      <label for="edit-sale-amount">Monto de la venta</label>
      <div class="money-input">
        <span aria-hidden="true">$</span>
        <input
          bind:this={amountInput}
          id="edit-sale-amount"
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
        <button type="button" onclick={close}>Cancelar</button>
        <button class="btn-primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar venta"}
        </button>
      </div>
      <button class="btn-danger" type="button" onclick={requestDelete}>
        Eliminar venta
      </button>
    </form>
  {/if}
</dialog>
