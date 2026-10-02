<script lang="ts">
  import type { Sale, SellerProfile } from "../domain/models";
  import { goalProgress } from "../domain/sale-calculations";
  import { filterSalesByRange } from "../domain/insight-calculations";

  interface Props {
    sales: Sale[];
    profile: SellerProfile;
    now: Date;
  }

  let { sales, profile, now }: Props = $props();

  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const progressFormatter = new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 1,
  });
  const year = $derived(now.getFullYear());
  const months = $derived(
    monthNames.map((name, index) => {
      const monthSales = filterSalesByRange(sales, {
        start: new Date(year, index, 1).toISOString(),
        end: new Date(year, index + 1, 1).toISOString(),
      });
      const progress = goalProgress(
        monthSales,
        profile.commissionRate,
        profile.monthlyCommissionGoal,
      );

      return {
        name,
        progress,
        progressLabel:
          progress > 0 && progress < 0.1
            ? "<0,1%"
            : `${progressFormatter.format(progress)}%`,
        saleCount: monthSales.length,
      };
    }),
  );
  const hasYearlySales = $derived(months.some((month) => month.saleCount > 0));
</script>

<section class="page-content" aria-labelledby="yearly-title">
  <header class="page-header">
    <p class="eyebrow">Resumen {year}</p>
    <h1 id="yearly-title">Progreso de cada mes</h1>
  </header>

  <div class="yearly-grid" aria-label={`Progreso mensual de ${year}`}>
    {#each months as month}
      <article>
        <small>{month.name}</small>
        <a
          href="#summary"
          class="progress-ring sm-ring"
          style={`--progress: ${month.progress}`}
          aria-label={`${month.name}: ${month.progressLabel} de la meta mensual. Volver al resumen`}
        >
          <span aria-hidden="true">{month.progressLabel}</span>
        </a>
      </article>
    {/each}
  </div>

  {#if !hasYearlySales}
    <article class="empty-state">
      <h2>Todavía no hay ventas en {year}</h2>
      <p>Usa el botón central para registrar la primera.</p>
    </article>
  {/if}
</section>
