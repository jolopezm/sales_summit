<script lang="ts">
  import type { Sale, SellerProfile } from "../domain/models";
  import SaleEditDialog from "../components/SaleEditDialog.svelte";
  import {
    accumulatedCommission,
    totalSales,
  } from "../domain/sale-calculations";
  import { filterSalesByRange } from "../domain/insight-calculations";
  interface Props {
    sales: Sale[];
    profile: SellerProfile;
    currency: Intl.NumberFormat;
    now: Date;
    onUpdate: (sale: Sale, amount: number) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }

  let { sales, profile, currency, now, onUpdate, onDelete }: Props = $props();
  let selectedSale = $state<Sale | null>(null);
  const monthSales = $derived(
    filterSalesByRange(sales, {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    }),
  );
  const total = $derived(totalSales(monthSales));
  const timeFormatter = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateFormatter = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
  });
</script>

<section class="page-content" aria-labelledby="sales-title">
  <header class="page-header">
    <p class="eyebrow">Este mes</p>
    <h1 id="sales-title">Ventas</h1>
    <p>Tus ventas se guardan únicamente en este dispositivo.</p>
  </header>

  <div class="summary-grid compact">
    <article>
      <strong>{monthSales.length}</strong><small>Ventas registradas</small>
    </article>
    <article>
      <strong>{currency.format(total)}</strong><small>Total vendido</small>
    </article>
  </div>

  {#if monthSales.length === 0}
    <article class="empty-state">
      <h2>Todavía no hay ventas</h2>
      <p>Usa el botón central para registrar la primera.</p>
    </article>
  {:else}
    <ol class="sales-list">
      {#each monthSales as sale (sale.id)}
        <li>
          <button
            type="button"
            onclick={() => (selectedSale = sale)}
            aria-label={`Editar venta de ${currency.format(sale.amount)}`}
          >
            <span class="sale-value">
              <strong>{currency.format(sale.amount)}</strong>
              <small
                >| {currency.format(
                  accumulatedCommission([sale], profile.commissionRate),
                )}</small
              >
            </span>
            <span>
              <time datetime={sale.soldAt}
                >{timeFormatter.format(new Date(sale.soldAt))}</time
              >
              <time datetime={sale.soldAt}
                >{dateFormatter.format(new Date(sale.soldAt))}</time
              >
            </span>
          </button>
        </li>
      {/each}
    </ol>
  {/if}

  <SaleEditDialog
    sale={selectedSale}
    onClose={() => (selectedSale = null)}
    onSave={onUpdate}
    onDelete={onDelete}
  />
</section>
