<script lang="ts">
  import {
    accumulatedCommission,
    averageSale,
    estimatedSalesNeededForCommissionGoal,
    goalProgress,
    grossSalesNeededForCommissionGoal,
    remainingCommission,
    totalSales,
  } from "../domain/sale-calculations";
  import { filterSalesByRange } from "../domain/insight-calculations";
  import type { Sale, SellerProfile } from "../domain/models";

  interface Props {
    profile: SellerProfile;
    sales: Sale[];
    currency: Intl.NumberFormat;
    now: Date;
  }

  let { profile, sales, currency, now }: Props = $props();
  const monthStart = $derived(new Date(now.getFullYear(), now.getMonth(), 1));
  const nextMonth = $derived(
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
  );
  const monthSales = $derived(
    filterSalesByRange(sales, {
      start: monthStart.toISOString(),
      end: nextMonth.toISOString(),
    }),
  );
  const commission = $derived(
    accumulatedCommission(monthSales, profile.commissionRate),
  );
  const total = $derived(totalSales(monthSales));
  const average = $derived(averageSale(monthSales));
  const progress = $derived(
    goalProgress(
      monthSales,
      profile.commissionRate,
      profile.monthlyCommissionGoal,
    ),
  );
  const remaining = $derived(
    remainingCommission(
      monthSales,
      profile.commissionRate,
      profile.monthlyCommissionGoal,
    ),
  );
  const grossNeeded = $derived(
    grossSalesNeededForCommissionGoal(
      monthSales,
      profile.commissionRate,
      profile.monthlyCommissionGoal,
    ),
  );
  const salesNeeded = $derived(
    estimatedSalesNeededForCommissionGoal(
      monthSales,
      profile.commissionRate,
      profile.monthlyCommissionGoal,
    ),
  );
  const monthFormatter = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  });
  const progressFormatter = new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 1,
  });
  const monthLabel = $derived(monthFormatter.format(now));
  const progressLabel = $derived(
    progress > 0 && progress < 0.01
      ? "<0,01%"
      : `${progressFormatter.format(progress)}%`,
  );
</script>

<header class="page-header">
  <p class="eyebrow">{monthLabel}</p>
  <h1>Hola, {profile.name}</h1>
  <p>Este es tu avance hacia la meta de comisiones.</p>
</header>

<section
  aria-label={`${progressLabel} de la meta mensual de comisiones completada`}
>
  <article class="goal-card">
    <div>
      <span class="metric-label">Comisiones acumuladas</span>
      <strong class="hero-amount">{currency.format(commission)}</strong>
      <p>Meta: {currency.format(profile.monthlyCommissionGoal)}</p>
    </div>
    <div
      class="progress-ring"
      style={`--progress: ${progress}`}
      aria-hidden="true"
    >
      <span>{progressLabel}</span>
    </div>
  </article>
</section>

<section class="summary-grid" aria-label="Resumen de la meta">
  <article>
    <span class="metric-label">Comisión restante</span>
    <strong>{currency.format(remaining)}</strong>
    <small>para alcanzar tu meta</small>
  </article>
  <article class="dark-card">
    <span class="metric-label">Debes vender</span>
    <strong>{currency.format(grossNeeded)}</strong>
    <small>con tu comisión actual</small>
  </article>
  <article>
    <span class="metric-label">Ventas estimadas</span>
    <strong>{average > 0 ? salesNeeded : "—"}</strong>
    <small
      >{average > 0
        ? `con un promedio de ${currency.format(average)}`
        : "Registra una venta para estimarlas"}</small
    >
  </article>
  <article>
    <span class="metric-label">Total vendido</span>
    <strong>{currency.format(total)}</strong>
    <small
      >{monthSales.length}
      {monthSales.length === 1 ? "venta" : "ventas"} este mes</small
    >
  </article>
</section>
