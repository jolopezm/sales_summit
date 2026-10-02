<script lang="ts">
  import MonthDetailsDialog from "../components/MonthDetailsDialog.svelte";
  import type { Sale, SellerProfile } from "../domain/models";
  import {
    accumulatedCommission,
    goalProgress,
    totalSales,
  } from "../domain/sale-calculations";
  import { filterSalesByRange } from "../domain/insight-calculations";
  import { faL } from "@fortawesome/free-solid-svg-icons";

  interface Props {
    sales: Sale[];
    profile: SellerProfile;
    currency: Intl.NumberFormat;
    now: Date;
  }

  interface MonthSummary {
    name: string;
    progress: number;
    progressLabel: string;
    commission: number;
    totalSold: number;
    saleCount: number;
    regularSaleCount: number;
    retailSaleCount: number;
  }

  let { sales, profile, currency, now }: Props = $props();
  let selectedMonthIndex = $state<number | null>(null);

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
  const months: MonthSummary[] = $derived(
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
      const retailSaleCount = monthSales.filter(
        (sale) => sale.retailCommissionRate !== undefined,
      ).length;

      return {
        name,
        progress,
        progressLabel:
          progress > 0 && progress < 0.1
            ? "<0,1%"
            : `${progressFormatter.format(progress)}%`,
        commission: accumulatedCommission(monthSales, profile.commissionRate),
        totalSold: totalSales(monthSales),
        saleCount: monthSales.length,
        regularSaleCount: monthSales.length - retailSaleCount,
        retailSaleCount,
      };
    }),
  );
  const selectedMonth = $derived(
    selectedMonthIndex === null
      ? null
      : (months[selectedMonthIndex] ?? null),
  );
  const hasYearlySales = $derived(months.some((month) => month.saleCount > 0));
</script>

<section class="page-content" aria-labelledby="yearly-title">
  <header class="page-header">
    <p class="eyebrow">Resumen {year}</p>
    <h1 id="yearly-title">Progreso de cada mes</h1>
  </header>

  <div class="yearly-grid" aria-label={`Progreso mensual de ${year}`}>
    {#each months as month, index}
      <article>
        <small>{month.name}</small>
        <button
          type="button"
          class="progress-ring sm-ring month-trigger"
          style={`--progress: ${month.progress}`}
          aria-label={`Ver detalle de ${month.name}: ${month.progressLabel} de la meta mensual`}
          onclick={() => (selectedMonthIndex = index)}
        >
          <span aria-hidden="true">{month.progressLabel}</span>
        </button>
      </article>
    {/each}
  </div>

  <MonthDetailsDialog
    month={selectedMonth}
    goal={profile.monthlyCommissionGoal}
    {currency}
    onClose={() => (selectedMonthIndex = null)}
  />

  {#if !hasYearlySales}
    <article class="empty-state">
      <h2>Todavía no hay ventas en {year}</h2>
      <p>Usa el botón central para registrar la primera.</p>
    </article>
  {/if}
</section>
