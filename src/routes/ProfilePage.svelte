<script lang="ts">
  import type { SellerProfile } from "../domain/models";
  import { isMoneyAmount } from "../domain/sale-calculations";
  import { isValidWorkSchedule } from "../domain/insight-calculations";

  interface Props {
    profile: SellerProfile;
    onSave: (
      profile: SellerProfile,
      applyRetailRateToExistingSales?: boolean,
    ) => Promise<void>;
    onboarding?: boolean;
    hasRetailSales?: boolean;
  }

  const days = [
    { value: 0, short: "D", name: "Domingo" },
    { value: 1, short: "L", name: "Lunes" },
    { value: 2, short: "M", name: "Martes" },
    { value: 3, short: "X", name: "Miércoles" },
    { value: 4, short: "J", name: "Jueves" },
    { value: 5, short: "V", name: "Viernes" },
    { value: 6, short: "S", name: "Sábado" },
  ];

  let {
    profile,
    onSave,
    onboarding = false,
    hasRetailSales = false,
  }: Props = $props();
  let name = $state("");
  let monthlyCommissionGoalText = $state("");
  let commissionPercent = $state(0);
  let commissionPercentRetail = $state<number | undefined>(undefined);
  let weekdays = $state<number[]>([]);
  let startTime = $state("");
  let endTime = $state("");
  let breakHour = $state("");
  let saving = $state(false);
  let error = $state("");
  let rateChangeDialog = $state<HTMLDialogElement>();
  let pendingProfile = $state<SellerProfile | null>(null);
  let confirmationError = $state("");
  let initialized = false;
  const amountFormatter = new Intl.NumberFormat("es-CL");

  $effect(() => {
    if (initialized) return;
    name = profile.name;
    monthlyCommissionGoalText = profile.monthlyCommissionGoal
      ? amountFormatter.format(profile.monthlyCommissionGoal)
      : "";
    commissionPercent = profile.commissionRate * 100;
    commissionPercentRetail =
      profile.commissionRateRetail === undefined
        ? undefined
        : profile.commissionRateRetail * 100;
    weekdays = [...profile.workSchedule.weekdays];
    startTime = profile.workSchedule.startTime;
    endTime = profile.workSchedule.endTime;
    breakHour = profile.workSchedule.breakHour;
    initialized = true;
  });

  function toggleDay(day: number) {
    weekdays = weekdays.includes(day)
      ? weekdays.filter((current) => current !== day)
      : [...weekdays, day].sort();
  }

  function updateMonthlyCommissionGoal(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "");

    monthlyCommissionGoalText = digits
      ? amountFormatter.format(Number(digits))
      : "";
  }

  async function save(
    updatedProfile: SellerProfile,
    applyRetailRateToExistingSales = false,
  ) {
    saving = true;
    try {
      await onSave(updatedProfile, applyRetailRateToExistingSales);
      pendingProfile = null;
      rateChangeDialog?.close();
    } catch {
      const message = "No pudimos guardar los cambios.";
      error = message;
      confirmationError = message;
    } finally {
      saving = false;
    }
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    confirmationError = "";
    const monthlyCommissionGoal = Number(
      monthlyCommissionGoalText.replace(/\D/g, ""),
    );
    const schedule = { weekdays, startTime, endTime, breakHour };
    if (!name.trim()) error = "Ingresa tu nombre.";
    else if (
      !isMoneyAmount(monthlyCommissionGoal) ||
      monthlyCommissionGoal <= 0
    ) {
      error = "La meta debe ser un monto entero mayor que cero.";
    } else if (!(commissionPercent > 0 && commissionPercent <= 100)) {
      error = "La comisión debe estar entre 0 y 100%.";
    } else if (
      commissionPercentRetail !== undefined &&
      !(commissionPercentRetail > 0 && commissionPercentRetail <= 100)
    ) {
      error = "La comisión retail debe estar entre 0 y 100%.";
    } else if (commissionPercentRetail === undefined && hasRetailSales) {
      error =
        "No puedes eliminar la comisión retail mientras existan ventas retail.";
    } else if (!isValidWorkSchedule(schedule)) {
      error =
        "Elige al menos un día y un horario de salida posterior a la entrada.";
    }
    if (error) return;

    const updatedProfile: SellerProfile = {
      name: name.trim(),
      monthlyCommissionGoal,
      commissionRate: commissionPercent / 100,
      ...(commissionPercentRetail === undefined
        ? {}
        : { commissionRateRetail: commissionPercentRetail / 100 }),
      workSchedule: schedule,
    };
    const retailRateChanged =
      profile.commissionRateRetail !== undefined &&
      updatedProfile.commissionRateRetail !== undefined &&
      Math.abs(
        profile.commissionRateRetail - updatedProfile.commissionRateRetail,
      ) > 1e-12;

    if (retailRateChanged && hasRetailSales) {
      pendingProfile = updatedProfile;
      requestAnimationFrame(() => rateChangeDialog?.showModal());
      return;
    }

    await save(updatedProfile);
  }

  function cancelRateChange() {
    if (saving) return;
    pendingProfile = null;
    confirmationError = "";
    rateChangeDialog?.close();
  }
</script>

<section class="page-content" aria-labelledby="profile-title">
  <header class="page-header">
    <p class="eyebrow">{onboarding ? "Primeros pasos" : "Configuración"}</p>
    <h1 id="profile-title">
      {onboarding ? "Configura tu perfil" : "Tu perfil"}
    </h1>
    <p>
      {onboarding
        ? "Ingresa tus datos para comenzar a registrar tus ventas."
        : "Define tu meta de comisiones y las horas que trabajas."}
    </p>
  </header>

  <form class="profile-form" onsubmit={submit}>
    <article class="form-card">
      <h2>Datos personales</h2>
      <div class="field">
        <label for="username">Nombre</label>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={name}
          required
        />
      </div>
      <div class="field">
        <label for="monthly-goal">Meta mensual de comisiones</label>
        <input
          id="monthly-goal"
          name="monthlyGoal"
          type="text"
          inputmode="numeric"
          value={monthlyCommissionGoalText}
          oninput={updateMonthlyCommissionGoal}
          placeholder="0"
          required
        />
      </div>
      <div class="field">
        <label for="commission-rate">Porcentaje de comisión</label>
        <div class="suffix-input">
          <input
            id="commission-rate"
            name="commissionRate"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            bind:value={commissionPercent}
            required
          />
          <span>%</span>
        </div>
      </div>

      <div class="field">
        <label for="commission-rate-retail"
          >Porcentaje de comisión retail (opcional)</label
        >
        <div class="suffix-input">
          <input
            id="commission-rate-retail"
            name="commissionRateRetail"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            bind:value={commissionPercentRetail}
          />
          <span>%</span>
        </div>
      </div>
    </article>

    <article class="form-card schedule-card">
      <h2>Horario</h2>
      <fieldset>
        <legend>Días de trabajo</legend>
        <div class="weekday-picker">
          {#each days as day}
            <button
              type="button"
              class:active={weekdays.includes(day.value)}
              aria-pressed={weekdays.includes(day.value)}
              aria-label={day.name}
              onclick={() => toggleDay(day.value)}>{day.short}</button
            >
          {/each}
        </div>
      </fieldset>
      <div class="schedule-times">
        <div class="field">
          <label for="start-time">Entrada</label>
          <input
            id="start-time"
            name="startTime"
            type="time"
            bind:value={startTime}
            required
          />
        </div>
        <div class="field">
          <label for="end-time">Salida</label>
          <input
            id="end-time"
            name="endTime"
            type="time"
            bind:value={endTime}
            required
          />
        </div>
      </div>

      <div class="field">
        <label for="break-hour">Hora de almuerzo o break</label>
        <input
          id="break-hour"
          name="breakHour"
          type="time"
          bind:value={breakHour}
        />
      </div>
      <p class="form-help">
        Las proyecciones usan las horas programadas transcurridas en el mes.
      </p>
    </article>

    {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    <button class="btn-primary save-profile" type="submit" disabled={saving}>
      {saving ? "Guardando…" : onboarding ? "Comenzar" : "Guardar cambios"}
    </button>
  </form>
</section>

<dialog
  bind:this={rateChangeDialog}
  aria-labelledby="retail-rate-change-title"
  onclose={() => {
    if (!saving) pendingProfile = null;
  }}
>
  <section class="rate-change-confirmation">
    <h2 id="retail-rate-change-title">¿Dónde aplicamos la nueva tasa?</h2>
    <p>
      Puedes recalcular todas tus ventas retail o conservar su tasa actual y
      usar la nueva sólo en ventas futuras.
    </p>
    {#if confirmationError}
      <p class="form-error" role="alert">{confirmationError}</p>
    {/if}
    <button
      class="btn-primary"
      type="button"
      disabled={saving}
      onclick={() => pendingProfile && save(pendingProfile, true)}
    >
      Aplicar a todas
    </button>
    <button
      type="button"
      disabled={saving}
      onclick={() => pendingProfile && save(pendingProfile)}
    >
      Sólo ventas futuras
    </button>
    <button type="button" disabled={saving} onclick={cancelRateChange}
      >Cancelar</button
    >
  </section>
</dialog>
