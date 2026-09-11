<script lang="ts">
  import type { Sale } from "../domain/models";
  import { totalSales } from "../domain/sale-calculations";

  interface Props {
    sales: Sale[];
    currency: Intl.NumberFormat;
  }

  let { sales, currency }: Props = $props();

  const timeFormatter = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateFormatter = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
  });

  const total = $derived(totalSales(sales));
</script>

<section class="page-content" aria-labelledby="sales-title">
  <h2 id="sales-title" class="page-title">Ventas</h2>
  <p class="page-description">Tus ventas registradas este mes.</p>

  <div class="sales-info-cards">
    <article>
      <strong>{sales.length}</strong>
      <small>Ventas hechas</small>
    </article>
    <article>
      <strong>{currency.format(total)}</strong><small>Total vendido</small>
    </article>
  </div>

  <div class="sales-list">
    {#each sales as sale}
      <ol class="ventas">
        <li>
          <strong class="monto">{currency.format(sale.amount)}</strong>
          <span class="sale-timestamp">
            <time class="hora" datetime={sale.soldAt}>
              {timeFormatter.format(new Date(sale.soldAt))}
            </time>
            <time class="fecha" datetime={sale.soldAt}>
              {dateFormatter.format(new Date(sale.soldAt))}
            </time>
          </span>
        </li>
      </ol>
    {/each}
  </div>
</section>
