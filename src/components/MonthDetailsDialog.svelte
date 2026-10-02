<script lang="ts">
  interface MonthDetail {
    name: string;
    progress: number;
    progressLabel: string;
    commission: number;
    totalSold: number;
    saleCount: number;
    regularSaleCount: number;
    retailSaleCount: number;
  }

  interface Props {
    month: MonthDetail | null;
    goal: number;
    currency: Intl.NumberFormat;
    onClose: () => void;
  }

  let { month, goal, currency, onClose }: Props = $props();
  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (month && dialog && !dialog.open) dialog.showModal();
    if (!month && dialog?.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  aria-labelledby="month-detail-title"
  onclose={onClose}
  onclick={(event) => event.target === dialog && onClose()}
>
  {#if month}
    <section class="month-detail">
      <header class="month-detail-header">
        <div>
          <small>Detalle mensual</small>
          <h2 id="month-detail-title">{month.name}</h2>
        </div>
        <button
          type="button"
          class="dialog-close"
          aria-label="Cerrar detalle mensual"
          onclick={onClose}
        >
          &times;
        </button>
      </header>

      <div
        class="month-detail-goal"
        aria-label={`${month.progressLabel} de la meta mensual`}
      >
        <div>
          <span class="metric-label">Comisiones obtenidas</span>
          <strong>{currency.format(month.commission)}</strong>
          <small>Meta: {currency.format(goal)}</small>
        </div>
        <div
          class="progress-ring"
          style={`--progress: ${month.progress}`}
          aria-hidden="true"
        >
          <span>{month.progressLabel}</span>
        </div>
      </div>

      <dl class="month-detail-metrics">
        <div>
          <dt>Total vendido</dt>
          <dd>{currency.format(month.totalSold)}</dd>
        </div>
        <div>
          <dt>Ventas realizadas</dt>
          <dd>{month.saleCount}</dd>
        </div>
        <div>
          <dt>Ventas comunes</dt>
          <dd>{month.regularSaleCount}</dd>
        </div>
        <div>
          <dt>Ventas retail</dt>
          <dd>{month.retailSaleCount}</dd>
        </div>
      </dl>
    </section>
  {/if}
</dialog>
