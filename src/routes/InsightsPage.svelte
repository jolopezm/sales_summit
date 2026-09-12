<script lang="ts">
  import type { Sale, SellerProfile } from "../domain/models";
  import { accumulatedCommission, averageSale, totalSales } from "../domain/sale-calculations";
  import {
    averageCommissionPerWorkedDay,
    bestSalesDay,
    bestTimeSlot,
    bestWeekday,
    commissionNeededPerRemainingWorkday,
    filterSalesByRange,
    hasSufficientData,
    monthlyCommissionProjection,
    percentageVariation,
    salesByDay,
  } from "../domain/insight-calculations";

  interface Props {
    profile: SellerProfile;
    sales: Sale[];
    currency: Intl.NumberFormat;
    now: Date;
  }

  const weekdayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  let { profile, sales, currency, now }: Props = $props();
  let selectedMonth = $state("");
  const currentMonthValue = $derived(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  $effect(() => {
    if (!selectedMonth) selectedMonth = currentMonthValue;
  });

  function monthRange(value: string, offset = 0) {
    const safeValue = /^\d{4}-(?:0[1-9]|1[0-2])$/.test(value) ? value : currentMonthValue;
    const [year, month] = safeValue.split("-").map(Number);
    const start = new Date(year, month - 1 + offset, 1);
    const end = new Date(year, month + offset, 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  const periodSales = $derived(filterSalesByRange(sales, monthRange(selectedMonth)));
  const previousSales = $derived(filterSalesByRange(sales, monthRange(selectedMonth, -1)));
  const average = $derived(averageSale(periodSales));
  const commission = $derived(accumulatedCommission(periodSales, profile.commissionRate));
  const variation = $derived(percentageVariation(totalSales(periodSales), totalSales(previousSales)));
  const dailySales = $derived(salesByDay(periodSales));
  const maxDailyAmount = $derived(Math.max(1, ...dailySales.map((day) => day.totalAmount)));
  const bestDay = $derived(bestSalesDay(periodSales));
  const sufficient = $derived(hasSufficientData(periodSales));
  const topWeekday = $derived(sufficient ? bestWeekday(periodSales) : null);
  const topTimeSlot = $derived(sufficient ? bestTimeSlot(periodSales) : null);
  const isCurrentMonth = $derived(selectedMonth === currentMonthValue);
  const projection = $derived(
    isCurrentMonth && sufficient
      ? monthlyCommissionProjection(periodSales, profile.commissionRate, profile.workSchedule, now)
      : null,
  );
  const projectedGoalPercent = $derived(
    projection === null || profile.monthlyCommissionGoal <= 0
      ? null
      : Math.round((projection / profile.monthlyCommissionGoal) * 100),
  );
  const dailyAverage = $derived(
    isCurrentMonth && sufficient
      ? averageCommissionPerWorkedDay(periodSales, profile.commissionRate, profile.workSchedule, now)
      : null,
  );
  const neededDaily = $derived(
    isCurrentMonth
      ? commissionNeededPerRemainingWorkday(
          periodSales,
          profile.commissionRate,
          profile.monthlyCommissionGoal,
          profile.workSchedule,
          now,
        )
      : null,
  );
  const dateFormatter = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", timeZone: "UTC" });
</script>

<section class="page-content" aria-labelledby="insights-title">
  <header class="page-header insights-header">
    <div>
      <p class="eyebrow">Análisis local</p>
      <h1 id="insights-title">Insights</h1>
      <p>Entiende tu ritmo sin enviar tus datos a internet.</p>
    </div>
    <label class="period-field" for="period">
      <span>Período</span>
      <input id="period" type="month" max={currentMonthValue} bind:value={selectedMonth} required />
    </label>
  </header>

  <div class="metrics-grid">
    <article>
      <span class="metric-label">Venta promedio</span>
      <strong>{currency.format(average)}</strong>
    </article>
    <article>
      <span class="metric-label">Comisión estimada</span>
      <strong>{currency.format(commission)}</strong>
    </article>
    <article>
      <span class="metric-label">Variación mensual</span>
      <strong class:positive={variation !== null && variation >= 0}>
        {variation === null ? "—" : `${variation > 0 ? "+" : ""}${variation}%`}
      </strong>
      <small>{variation === null ? "Sin período anterior comparable" : "frente al mes anterior"}</small>
    </article>
  </div>

  <article class="chart-card">
    <div class="section-heading">
      <div><span class="metric-label">Ventas por día</span><h2>Actividad del período</h2></div>
      {#if bestDay}<span class="best-badge">Mejor día: {dateFormatter.format(new Date(`${bestDay.date}T00:00:00Z`))}</span>{/if}
    </div>
    {#if dailySales.length === 0}
      <div class="empty-chart">Registra ventas para ver el gráfico.</div>
    {:else}
      <div class="bar-chart" role="img" aria-label="Gráfico de ventas por día">
        {#each dailySales as day}
          <div class="bar-column" title={`${day.date}: ${currency.format(day.totalAmount)}`}>
            <span class:best={day.date === bestDay?.date} style={`height: ${Math.max(8, (day.totalAmount / maxDailyAmount) * 100)}%`}></span>
            <small>{day.date.slice(8)}</small>
          </div>
        {/each}
      </div>
      <ul class="sr-only">
        {#each dailySales as day}<li>{day.date}: {currency.format(day.totalAmount)}</li>{/each}
      </ul>
    {/if}
  </article>

  {#if !sufficient}
    <article class="insufficient-state">
      <h2>Estamos reuniendo información</h2>
      <p>Necesitamos al menos 5 ventas distribuidas en 3 días para mostrar tendencias confiables.</p>
    </article>
  {:else}
    {#if isCurrentMonth && projectedGoalPercent !== null}
      <article class="pace-card">
        <span class="metric-label">Proyección de cierre</span>
        <strong>{currency.format(projection ?? 0)}</strong>
        <p>Al ritmo actual alcanzarías el {projectedGoalPercent}% de tu meta.</p>
      </article>
      <div class="metrics-grid">
        <article><span class="metric-label">Promedio por día laborable</span><strong>{currency.format(dailyAverage ?? 0)}</strong><small>en comisiones</small></article>
        <article><span class="metric-label">Necesario por día restante</span><strong>{currency.format(neededDaily ?? 0)}</strong><small>en comisiones</small></article>
      </div>
    {/if}
    <div class="metrics-grid conclusions">
      <article><span class="metric-label">Día con mayor facturación</span><strong>{topWeekday ? weekdayNames[topWeekday.weekday] : "—"}</strong></article>
      <article><span class="metric-label">Franja más productiva</span><strong>{topTimeSlot ? `${topTimeSlot.startTime}–${topTimeSlot.endTime}` : "—"}</strong></article>
    </div>
  {/if}
</section>
