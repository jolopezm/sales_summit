<script lang="ts">
  import {
    accumulatedCommission,
    goalProgress,
    remainingToGoal,
    totalSales,
  } from "../domain/sale-calculations";
  import type { Sale, SellerProfile } from "../domain/models";

  interface Props {
    profile: SellerProfile;
    sales: Sale[];
    currency: Intl.NumberFormat;
  }

  let { profile, sales, currency }: Props = $props();

  const commsAmount = $derived(
    accumulatedCommission(sales, profile.commissionRate),
  );
  const total = $derived(totalSales(sales));
  const progress = $derived(goalProgress(sales, profile.monthlyGoal));
  const remaining = $derived(remainingToGoal(sales, profile.monthlyGoal));
</script>

<header>
  <p class="eyebrow">SEPTIEMBRE DE 2026</p>
  <h2 class="greeting">Hola, {profile.name}</h2>
</header>

<section aria-label={`${progress}% of monthly sales goal completed`}>
  <article class="goal-card">
    <div class="goal-heading">
      <strong>Tu progreso este mes</strong>
    </div>

    <div class="goal-overview">
      <div class="goal-amount">
        <span>Comisiones acumuladas</span>
        <strong>{currency.format(commsAmount)}</strong>
        <p>Meta {currency.format(profile.monthlyGoal)}</p>
      </div>

      <div class="progress-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="48" />
          <circle
            class="ring-value"
            cx="60"
            cy="60"
            r="48"
            pathLength="100"
            stroke-dasharray={`${progress} 100`}
          />
          <text class="ring-percentage" x="65" y="65" text-anchor="middle">
            {progress}%
          </text>
        </svg>
      </div>
    </div>
  </article>
</section>

<section aria-labelledby="pace-title">
  <div class="summary-cards">
    <article class="summary-insight">
      <strong>Restante</strong>
      <span class="number">
        {currency.format(remaining)}
      </span>
      <span>para alcanzar tu meta</span>
    </article>
    <article class="summary-insight sales-remaining">
      <strong>Ventas necesarias</strong>
      <span class="number">{sales.length}</span>
      <span class="description">estimadas segun tu promedio</span>
    </article>
  </div>
</section>

<style>
  .goal-card {
    --progress-color: #318cf5;
    color: #14233d;
    margin-bottom: 1rem;
  }

  .goal-heading h2,
  .goal-heading p,
  .goal-amount p {
    margin: 0;
  }

  .goal-heading h2 {
    font-size: 1.15rem;
    line-height: 1.25;
  }

  .goal-heading p,
  .goal-amount span,
  .goal-amount p,
  .ring-caption {
    color: #71819a;
  }

  .goal-heading p,
  .goal-amount span,
  .goal-amount p {
    font-size: 0.8rem;
  }

  .goal-overview {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 7.5rem;
    align-items: center;
    gap: 0.75rem;
  }

  .goal-amount {
    display: grid;
    gap: 0.2rem;
  }

  .goal-amount strong {
    font-size: clamp(1.8rem, 9vw, 2.3rem);
    line-height: 1.1;
    letter-spacing: -0.04em;
  }

  .progress-ring svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .ring-track,
  .ring-value {
    fill: none;
    stroke-width: 13;
  }

  .ring-track {
    stroke: #e4ebf5;
  }

  .ring-value {
    stroke: var(--progress-color);
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: center;
  }

  .ring-percentage {
    fill: #14233d;
    font-size: 1.45rem;
    font-weight: 800;
  }

  .ring-caption {
    fill: #71819a;
    font-size: 0.68rem;
    font-weight: 600;
  }

  .progress-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.65rem;
  }

  .progress-row progress {
    width: 100%;
    height: 0.65rem;
    overflow: hidden;
    border: 0;
    border-radius: 999px;
    background: #e4ebf5;
  }

  .progress-row progress::-webkit-progress-bar {
    background: #e4ebf5;
    border-radius: 999px;
  }

  .progress-row progress::-webkit-progress-value {
    background: var(--progress-color);
    border-radius: 999px;
  }

  .progress-row progress::-moz-progress-bar {
    background: var(--progress-color);
    border-radius: 999px;
  }

  .progress-row strong {
    font-size: 0.75rem;
  }

  @media (max-width: 360px) {
    .goal-overview {
      grid-template-columns: minmax(0, 1fr) 6.5rem;
      gap: 0.4rem;
    }

    .goal-amount strong {
      font-size: 1.7rem;
    }
  }
</style>
