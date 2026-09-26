<script lang="ts">
  import type { Sale, SellerProfile } from "../domain/models";
  import SaleEditDialog from "../components/SaleEditDialog.svelte";
  import {
    accumulatedCommission,
    totalSales,
  } from "../domain/sale-calculations";
  import {
    filterSalesByRange,
    groupSalesByDay,
  } from "../domain/insight-calculations";
  interface Props {
    sales: Sale[];
    profile: SellerProfile;
    currency: Intl.NumberFormat;
    now: Date;
    onUpdate: (
      sale: Sale,
      amount: number,
      retailCommissionRate?: number,
    ) => Promise<void>;
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
  const groupedSales = $derived(
    groupSalesByDay(monthSales)
      .reverse()
      .map((group) => ({
        ...group,
        total: totalSales(group.sales),
        largestAmount: Math.max(...group.sales.map((sale) => sale.amount)),
        commission: accumulatedCommission(
          group.sales,
          profile.commissionRate,
        ),
      })),
  );
  function formatDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  }
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
    <div class="sales-by-day">
      {#each groupedSales as group (group.date)}
        <article class="sales-day">
          <header class="sales-day-header">
            <h2>
              <time datetime={group.date}>{formatDate(group.date)}</time>
            </h2>
            <dl>
              <div>
                <dt>Vendido</dt>
                <dd>{currency.format(group.total)}</dd>
              </div>
              <div>
                <dt>Comisión</dt>
                <dd>{currency.format(group.commission)}</dd>
              </div>
            </dl>
          </header>
          <ol class="sales-list">
            {#each group.sales as sale (sale.id)}
              <li>
                <button
                  type="button"
                  onclick={() => (selectedSale = sale)}
                  aria-label={`Editar venta de ${currency.format(sale.amount)}`}
                >
                  <span class="sale-value">
                    <span class="sale-amount">
                      <strong class:largest-sale={sale.amount === group.largestAmount}
                        >{currency.format(sale.amount)}</strong
                      >
                      {#if sale.retailCommissionRate !== undefined}
                        <span class="retail-badge">Retail</span>
                      {/if}
                    </span>
                    <small
                      >| {currency.format(
                        accumulatedCommission([sale], profile.commissionRate),
                      )}</small
                    >
                  </span>
                  <time class="sale-time" datetime={sale.soldAt}
                    >{timeFormatter.format(new Date(sale.soldAt))}</time
                  >
                </button>
              </li>
            {/each}
          </ol>
        </article>
      {/each}
    </div>
  {/if}

  <SaleEditDialog
    sale={selectedSale}
    retailCommissionRate={profile.commissionRateRetail}
    onClose={() => (selectedSale = null)}
    onSave={onUpdate}
    {onDelete}
  />
</section>
